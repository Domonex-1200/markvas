import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import type { AssetMetadata, AssetType } from "../common/types";
import { User } from "../users/user.entity";
import { AssetVersion } from "./asset-version.entity";
import { CartItem } from "./cart-item.entity";
import { Entitlement } from "./entitlement.entity";
import { UserAsset } from "./user-asset.entity";
import { WishlistItem } from "./wishlist-item.entity";

@Entity("assets")
export class Asset {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column({ type: "enum", enum: ["THEME", "PLUGIN", "TEMPLATE"] })
  type!: AssetType;

  @Column({ type: "jsonb", default: {} })
  metadata!: AssetMetadata;

  @Column()
  filePath!: string;

  @Column({ type: "enum", enum: ["FREE", "PAID"], default: "FREE" })
  pricingType!: "FREE" | "PAID";

  @Column({ type: "integer", default: 0 })
  priceCents!: number;

  @Column({ default: "USD" })
  currency!: string;

  @Column({ type: "enum", enum: ["DRAFT", "IN_REVIEW", "PUBLISHED", "REJECTED"], default: "PUBLISHED" })
  status!: "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "REJECTED";

  @Column()
  authorId!: string;

  @ManyToOne(() => User, (user) => user.assets, { onDelete: "CASCADE" })
  author!: User;

  @OneToMany(() => UserAsset, (userAsset) => userAsset.asset)
  installations!: UserAsset[];

  @OneToMany(() => AssetVersion, (version) => version.asset)
  versions!: AssetVersion[];

  @OneToMany(() => Entitlement, (entitlement) => entitlement.asset)
  entitlements!: Entitlement[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.asset)
  cartItems!: CartItem[];

  @OneToMany(() => WishlistItem, (wishlistItem) => wishlistItem.asset)
  wishlistItems!: WishlistItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
