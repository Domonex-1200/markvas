import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import type { AppReleaseChannel, AppReleasePlatform } from "../common/types";

@Entity("app_releases")
@Index(["platform", "channel", "version"], { unique: true })
export class AppReleaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  version!: string;

  @Column({ type: "enum", enum: ["windows", "macos", "linux"] })
  platform!: AppReleasePlatform;

  @Column({ type: "enum", enum: ["stable", "beta"], default: "stable" })
  channel!: AppReleaseChannel;

  @Column()
  downloadUrl!: string;

  @Column()
  checksum!: string;

  @Column({ type: "varchar", nullable: true })
  signature!: string | null;

  @Column({ type: "text" })
  releaseNotes!: string;

  @CreateDateColumn()
  publishedAt!: Date;
}
