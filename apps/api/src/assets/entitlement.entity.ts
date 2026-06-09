import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique, Column } from "typeorm";
import { User } from "../users/user.entity";
import { Asset } from "./asset.entity";

@Entity("entitlements")
@Unique(["user", "asset"])
export class Entitlement {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.entitlements, { onDelete: "CASCADE" })
  user!: User;

  @ManyToOne(() => Asset, (asset) => asset.entitlements, { eager: true, onDelete: "CASCADE" })
  asset!: Asset;

  @Column({ type: "enum", enum: ["FREE", "PURCHASE", "ADMIN_GRANT"], default: "FREE" })
  source!: "FREE" | "PURCHASE" | "ADMIN_GRANT";

  @CreateDateColumn()
  grantedAt!: Date;
}
