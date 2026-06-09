import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Asset } from "./asset.entity";

@Entity("asset_versions")
@Unique(["asset", "version"])
export class AssetVersion {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Asset, (asset) => asset.versions, { eager: true, onDelete: "CASCADE" })
  asset!: Asset;

  @Column()
  version!: string;

  @Column()
  filePath!: string;

  @Column({ type: "varchar", nullable: true })
  checksum!: string | null;

  @Column({ type: "varchar", nullable: true })
  signature!: string | null;

  @Column({ type: "jsonb", default: {} })
  releaseNotes!: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;
}
