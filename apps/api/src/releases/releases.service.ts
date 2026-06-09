import { ForbiddenException, Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import type { AppRelease, AppReleaseChannel, AppReleasePlatform, UserRole } from "../common/types";
import { AppReleaseEntity } from "./app-release.entity";
import { CreateAppReleaseDto } from "./dto";

const seedReleases: CreateAppReleaseDto[] = [
  {
    version: "0.1.0",
    platform: "windows",
    channel: "stable",
    downloadUrl: "https://github.com/your-org/markvas/releases/download/v0.1.0/MarkVas-Setup-0.1.0.exe",
    checksum: "sha256-dev-windows-placeholder",
    releaseNotes: "Windows desktop preview build with local Markdown editing, PDF export, templates, plugins, and store sync."
  }
];

@Injectable()
export class ReleasesService implements OnModuleInit {
  constructor(@InjectRepository(AppReleaseEntity) private readonly releases: Repository<AppReleaseEntity>) {}

  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV === "production") return;

    for (const release of seedReleases) {
      const exists = await this.releases.findOne({
        where: {
          version: release.version,
          platform: release.platform,
          channel: release.channel ?? "stable"
        }
      });
      if (!exists) {
        await this.releases.save(this.releases.create({ ...release, channel: release.channel ?? "stable", signature: release.signature ?? null }));
      }
    }
  }

  async list(): Promise<AppRelease[]> {
    const rows = await this.releases.find({ order: { publishedAt: "DESC" } });
    return rows.map(toAppRelease);
  }

  async latest(platform: AppReleasePlatform, channel: AppReleaseChannel): Promise<AppRelease> {
    const release = await this.releases.findOne({
      where: { platform, channel },
      order: { publishedAt: "DESC" }
    });
    if (!release) throw new NotFoundException("Release not found.");
    return toAppRelease(release);
  }

  async create(role: UserRole, dto: CreateAppReleaseDto): Promise<AppRelease> {
    if (role !== "ADMIN") throw new ForbiddenException("Admin role required.");
    const release = await this.releases.save(
      this.releases.create({
        ...dto,
        channel: dto.channel ?? "stable",
        signature: dto.signature ?? null
      })
    );
    return toAppRelease(release);
  }
}

function toAppRelease(release: AppReleaseEntity): AppRelease {
  const appRelease: AppRelease = {
    id: release.id,
    version: release.version,
    platform: release.platform,
    channel: release.channel,
    downloadUrl: release.downloadUrl,
    checksum: release.checksum,
    releaseNotes: release.releaseNotes,
    publishedAt: release.publishedAt.toISOString()
  };
  if (release.signature) appRelease.signature = release.signature;
  return appRelease;
}
