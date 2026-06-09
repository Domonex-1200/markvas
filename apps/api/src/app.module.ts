import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { AssetsModule } from "./assets/assets.module";
import { User } from "./users/user.entity";
import { Asset } from "./assets/asset.entity";
import { AssetVersion } from "./assets/asset-version.entity";
import { CartItem } from "./assets/cart-item.entity";
import { Entitlement } from "./assets/entitlement.entity";
import { UserAsset } from "./assets/user-asset.entity";
import { WishlistItem } from "./assets/wishlist-item.entity";
import { AppReleaseEntity } from "./releases/app-release.entity";
import { ReleasesModule } from "./releases/releases.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        url: config.getOrThrow<string>("DATABASE_URL"),
        entities: [User, Asset, AssetVersion, AppReleaseEntity, CartItem, Entitlement, UserAsset, WishlistItem],
        synchronize: config.get("NODE_ENV") !== "production",
        ssl: config.get("DATABASE_SSL") === "true" ? { rejectUnauthorized: false } : false
      })
    }),
    AuthModule,
    AssetsModule,
    ReleasesModule
  ]
})
export class AppModule {}
