import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppReleaseEntity } from "./app-release.entity";
import { ReleasesController } from "./releases.controller";
import { ReleasesService } from "./releases.service";

@Module({
  imports: [TypeOrmModule.forFeature([AppReleaseEntity])],
  controllers: [ReleasesController],
  providers: [ReleasesService]
})
export class ReleasesModule {}
