import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "../users/user.entity";
import { Asset } from "./asset.entity";

@Entity("wishlist_items")
@Unique(["user", "asset"])
export class WishlistItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.wishlistItems, { onDelete: "CASCADE" })
  user!: User;

  @ManyToOne(() => Asset, (asset) => asset.wishlistItems, { eager: true, onDelete: "CASCADE" })
  asset!: Asset;

  @CreateDateColumn()
  addedAt!: Date;
}
