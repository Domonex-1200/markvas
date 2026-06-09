import { IsIn, IsOptional, IsString } from "class-validator";
import type { AppReleaseChannel, AppReleasePlatform } from "../common/types";

export class CreateAppReleaseDto {
  @IsString()
  version!: string;

  @IsIn(["windows", "macos", "linux"])
  platform!: AppReleasePlatform;

  @IsOptional()
  @IsIn(["stable", "beta"])
  channel?: AppReleaseChannel;

  @IsString()
  downloadUrl!: string;

  @IsString()
  checksum!: string;

  @IsOptional()
  @IsString()
  signature?: string;

  @IsString()
  releaseNotes!: string;
}
