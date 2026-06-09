import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "../users/user.entity";
import { Asset } from "./asset.entity";

@Entity("user_assets")
@Unique(["user", "asset"])
export class UserAsset {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.installedAssets, { onDelete: "CASCADE" })
  user!: User;

  @ManyToOne(() => Asset, (asset) => asset.installations, { eager: true, onDelete: "CASCADE" })
  asset!: Asset;

  @CreateDateColumn()
  installedAt!: Date;
}
