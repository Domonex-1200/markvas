import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "../users/user.entity";
import { Asset } from "./asset.entity";

@Entity("cart_items")
@Unique(["user", "asset"])
export class CartItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.cartItems, { onDelete: "CASCADE" })
  user!: User;

  @ManyToOne(() => Asset, (asset) => asset.cartItems, { eager: true, onDelete: "CASCADE" })
  asset!: Asset;

  @CreateDateColumn()
  addedAt!: Date;
}
