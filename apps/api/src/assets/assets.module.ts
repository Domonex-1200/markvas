import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Asset } from "./asset.entity";
import { AssetVersion } from "./asset-version.entity";
import { AssetsController } from "./assets.controller";
import { AssetsService } from "./assets.service";
import { CartItem } from "./cart-item.entity";
import { Entitlement } from "./entitlement.entity";
import { UserAsset } from "./user-asset.entity";
import { User } from "../users/user.entity";
import { WishlistItem } from "./wishlist-item.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Asset, AssetVersion, CartItem, Entitlement, UserAsset, User, WishlistItem])],
  controllers: [AssetsController],
  providers: [AssetsService]
})
export class AssetsModule {}
