import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Asset } from "../assets/asset.entity";
import { CartItem } from "../assets/cart-item.entity";
import { Entitlement } from "../assets/entitlement.entity";
import { UserAsset } from "../assets/user-asset.entity";
import { WishlistItem } from "../assets/wishlist-item.entity";
import type { UserRole } from "../common/types";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: "enum", enum: ["USER", "DEVELOPER", "ADMIN"], default: "USER" })
  role!: UserRole;

  @Column({ type: "varchar", nullable: true })
  refreshTokenHash!: string | null;

  @OneToMany(() => Asset, (asset) => asset.author)
  assets!: Asset[];

  @OneToMany(() => UserAsset, (userAsset) => userAsset.user)
  installedAssets!: UserAsset[];

  @OneToMany(() => Entitlement, (entitlement) => entitlement.user)
  entitlements!: Entitlement[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.user)
  cartItems!: CartItem[];

  @OneToMany(() => WishlistItem, (wishlistItem) => wishlistItem.user)
  wishlistItems!: WishlistItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
