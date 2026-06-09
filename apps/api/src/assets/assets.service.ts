import { ForbiddenException, Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import type { StoreCartItem, StoreEntitlement, StoreWishlistItem, StoreAsset, UserRole } from "../common/types";
import { User } from "../users/user.entity";
import { Asset } from "./asset.entity";
import { AssetVersion } from "./asset-version.entity";
import { CartItem } from "./cart-item.entity";
import { CreateAssetDto } from "./dto";
import { Entitlement } from "./entitlement.entity";
import { UserAsset } from "./user-asset.entity";
import { WishlistItem } from "./wishlist-item.entity";

const SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000001";

@Injectable()
export class AssetsService implements OnModuleInit {
  constructor(
    @InjectRepository(Asset) private readonly assets: Repository<Asset>,
    @InjectRepository(AssetVersion) private readonly assetVersions: Repository<AssetVersion>,
    @InjectRepository(CartItem) private readonly cartItems: Repository<CartItem>,
    @InjectRepository(Entitlement) private readonly entitlements: Repository<Entitlement>,
    @InjectRepository(UserAsset) private readonly userAssets: Repository<UserAsset>,
    @InjectRepository(WishlistItem) private readonly wishlistItems: Repository<WishlistItem>,
    @InjectRepository(User) private readonly users: Repository<User>
  ) {}

  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV === "production") return;

    await this.users.upsert(
      {
        id: SYSTEM_USER_ID,
        email: "system@markdown-canvas.local",
        password: "system-managed",
        role: "ADMIN",
        refreshTokenHash: null
      },
      ["id"]
    );

    const seedAssets: CreateAssetDto[] = [
      {
        title: "Editorial Focus Theme",
        type: "THEME",
        filePath: "/assets/demo-editorial-theme/theme.css",
        metadata: {
          version: "1.0.0",
          description: "문서 미리보기와 PDF 출력에 사용할 수 있는 차분한 편집 테마입니다.",
          tokens: {
            colors: {
              paper: "#f8f7f3",
              accent: "#2b7a78",
              ink: "#1c2430"
            },
            editorCss:
              ".prose-canvas h1 { color: #2b7a78; } .prose-canvas blockquote { border-left: 3px solid #d66a50; padding-left: 16px; }",
            exportCss: "@page { margin: 16mm; }"
          }
        }
      },
      {
        title: "Decision Log Template",
        type: "TEMPLATE",
        filePath: "/assets/demo-decision-log/template.md",
        metadata: {
          version: "1.0.0",
          description: "결정 배경, 선택지, 결과를 추적하는 의사결정 기록 템플릿입니다.",
          template: {
            id: "decision-log",
            title: "의사결정 기록",
            description: "중요한 선택의 맥락과 결과를 남기는 노트",
            content:
              "---\ntitle: {{title}}\ntags: [decision]\ntemplate: decision-log\ncreated: {{date}}\n---\n\n# {{title}}\n\n## 배경\n\n\n## 선택지\n\n- \n\n## 결정\n\n\n## 결과 확인\n\n- [ ] \n"
          }
        }
      },
      {
        title: "Word Count Reporter",
        type: "PLUGIN",
        filePath: "/assets/demo-word-count/plugin.js",
        metadata: {
          version: "1.0.0",
          description: "현재 노트의 단어 수와 글자 수를 커맨드 팔레트에서 확인하는 샘플 플러그인입니다.",
          plugin: {
            id: "word-count-reporter",
            title: "Word Count Reporter",
            version: "1.0.0",
            description: "현재 노트의 단어 수와 글자 수를 알려줍니다.",
            permissions: ["note:read"],
            entryFile: "plugin.js",
            commands: [
              {
                id: "report-current-note",
                title: "현재 노트 통계 보기",
                description: "현재 열린 노트의 단어 수와 글자 수 표시"
              }
            ],
            code:
              "return function(input) { const content = input.document?.content ?? ''; const words = content.trim() ? content.trim().split(/\\s+/).length : 0; return `현재 노트: ${words} words, ${content.length} chars`; };"
          }
        }
      }
    ];

    for (const seed of seedAssets) {
      const exists = await this.assets.findOne({ where: { title: seed.title } });
      if (!exists) {
        const asset = await this.assets.save(this.assets.create({ ...seed, authorId: SYSTEM_USER_ID }));
        await this.assetVersions.save(
          this.assetVersions.create({
            asset,
            version: seed.metadata.version,
            filePath: seed.filePath,
            checksum: seed.metadata.checksum ?? null,
            signature: null,
            releaseNotes: { seed: true }
          })
        );
      }
    }
  }

  async list(): Promise<StoreAsset[]> {
    return (await this.assets.find({ where: { status: "PUBLISHED" }, order: { createdAt: "DESC" } })).map(toStoreAsset);
  }

  async listForReview(role: UserRole): Promise<StoreAsset[]> {
    if (role !== "ADMIN") throw new ForbiddenException("Admin role required.");
    return (await this.assets.find({ order: { createdAt: "DESC" } })).map(toStoreAsset);
  }

  async findOne(id: string): Promise<StoreAsset> {
    const asset = await this.assets.findOne({ where: { id } });
    if (!asset) throw new NotFoundException("Asset not found.");
    return toStoreAsset(asset);
  }

  async create(authorId: string, role: UserRole, dto: CreateAssetDto): Promise<StoreAsset> {
    if (!["DEVELOPER", "ADMIN"].includes(role)) throw new ForbiddenException("Developer role required.");
    const asset = await this.assets.save(
      this.assets.create({
        ...dto,
        authorId,
        pricingType: dto.pricingType ?? "FREE",
        priceCents: dto.priceCents ?? 0,
        currency: dto.currency ?? "USD",
        status: "DRAFT"
      })
    );
    await this.assetVersions.save(
      this.assetVersions.create({
        asset,
        version: dto.metadata.version,
        filePath: dto.filePath,
        checksum: dto.metadata.checksum ?? null,
        signature: null,
        releaseNotes: {}
      })
    );
    return toStoreAsset(asset);
  }

  async submitForReview(userId: string, role: UserRole, assetId: string): Promise<StoreAsset> {
    const asset = await this.findAssetEntity(assetId);
    if (asset.authorId !== userId && role !== "ADMIN") throw new ForbiddenException("Only the author can submit this asset.");
    asset.status = "IN_REVIEW";
    return toStoreAsset(await this.assets.save(asset));
  }

  async approve(role: UserRole, assetId: string): Promise<StoreAsset> {
    if (role !== "ADMIN") throw new ForbiddenException("Admin role required.");
    const asset = await this.findAssetEntity(assetId);
    asset.status = "PUBLISHED";
    return toStoreAsset(await this.assets.save(asset));
  }

  async reject(role: UserRole, assetId: string): Promise<StoreAsset> {
    if (role !== "ADMIN") throw new ForbiddenException("Admin role required.");
    const asset = await this.findAssetEntity(assetId);
    asset.status = "REJECTED";
    return toStoreAsset(await this.assets.save(asset));
  }

  async install(userId: string, assetId: string): Promise<void> {
    const asset = await this.assets.findOneBy({ id: assetId });
    if (!asset) throw new NotFoundException("Asset not found.");
    await this.ensureEntitlement(userId, asset, asset.pricingType === "FREE" ? "FREE" : "PURCHASE");
    const exists = await this.userAssets.findOne({ where: { user: { id: userId }, asset: { id: assetId } } });
    if (!exists) {
      await this.userAssets.save(this.userAssets.create({ user: { id: userId }, asset }));
    }
  }

  async installedByUser(userId: string) {
    const rows = await this.userAssets.find({
      where: { user: { id: userId } },
      order: { installedAt: "DESC" }
    });
    return rows.map((row) => ({ asset: toStoreAsset(row.asset), installedAt: row.installedAt.toISOString() }));
  }

  async entitlementsByUser(userId: string): Promise<StoreEntitlement[]> {
    const rows = await this.entitlements.find({
      where: { user: { id: userId } },
      order: { grantedAt: "DESC" }
    });
    return rows.map((row) => ({
      id: row.id,
      asset: toStoreAsset(row.asset),
      source: row.source,
      grantedAt: row.grantedAt.toISOString()
    }));
  }

  async addToWishlist(userId: string, assetId: string): Promise<void> {
    const asset = await this.findAssetEntity(assetId);
    const exists = await this.wishlistItems.findOne({ where: { user: { id: userId }, asset: { id: assetId } } });
    if (!exists) {
      await this.wishlistItems.save(this.wishlistItems.create({ user: { id: userId }, asset }));
    }
  }

  async removeFromWishlist(userId: string, assetId: string): Promise<void> {
    await this.wishlistItems.delete({ user: { id: userId }, asset: { id: assetId } });
  }

  async wishlistByUser(userId: string): Promise<StoreWishlistItem[]> {
    const rows = await this.wishlistItems.find({
      where: { user: { id: userId } },
      order: { addedAt: "DESC" }
    });
    return rows.map((row) => ({ id: row.id, asset: toStoreAsset(row.asset), addedAt: row.addedAt.toISOString() }));
  }

  async addToCart(userId: string, assetId: string): Promise<void> {
    const asset = await this.findAssetEntity(assetId);
    const exists = await this.cartItems.findOne({ where: { user: { id: userId }, asset: { id: assetId } } });
    if (!exists) {
      await this.cartItems.save(this.cartItems.create({ user: { id: userId }, asset }));
    }
  }

  async removeFromCart(userId: string, assetId: string): Promise<void> {
    await this.cartItems.delete({ user: { id: userId }, asset: { id: assetId } });
  }

  async cartByUser(userId: string): Promise<StoreCartItem[]> {
    const rows = await this.cartItems.find({
      where: { user: { id: userId } },
      order: { addedAt: "DESC" }
    });
    return rows.map((row) => ({ id: row.id, asset: toStoreAsset(row.asset), addedAt: row.addedAt.toISOString() }));
  }

  async checkoutFreeCart(userId: string): Promise<StoreEntitlement[]> {
    const rows = await this.cartItems.find({ where: { user: { id: userId } } });
    const granted: StoreEntitlement[] = [];
    for (const row of rows) {
      if (row.asset.pricingType !== "FREE") continue;
      const entitlement = await this.ensureEntitlement(userId, row.asset, "FREE");
      granted.push({
        id: entitlement.id,
        asset: toStoreAsset(entitlement.asset),
        source: entitlement.source,
        grantedAt: entitlement.grantedAt.toISOString()
      });
      await this.cartItems.delete({ id: row.id });
    }
    return granted;
  }

  private async findAssetEntity(assetId: string): Promise<Asset> {
    const asset = await this.assets.findOneBy({ id: assetId });
    if (!asset) throw new NotFoundException("Asset not found.");
    return asset;
  }

  private async ensureEntitlement(userId: string, asset: Asset, source: "FREE" | "PURCHASE" | "ADMIN_GRANT"): Promise<Entitlement> {
    const exists = await this.entitlements.findOne({ where: { user: { id: userId }, asset: { id: asset.id } } });
    if (exists) return exists;
    return this.entitlements.save(this.entitlements.create({ user: { id: userId }, asset, source }));
  }
}

function toStoreAsset(asset: Asset): StoreAsset {
  return {
    id: asset.id,
    title: asset.title,
    type: asset.type,
    metadata: asset.metadata,
    filePath: asset.filePath,
    authorId: asset.authorId,
    pricingType: asset.pricingType,
    priceCents: asset.priceCents,
    currency: asset.currency,
    status: asset.status,
    createdAt: asset.createdAt.toISOString()
  };
}
