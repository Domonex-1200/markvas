import { IsIn, IsInt, IsObject, IsOptional, IsString, Min } from "class-validator";
import type { AssetMetadata, AssetType } from "../common/types";

export class CreateAssetDto {
  @IsString()
  title!: string;

  @IsIn(["THEME", "PLUGIN", "TEMPLATE"])
  type!: AssetType;

  @IsObject()
  metadata!: AssetMetadata;

  @IsString()
  filePath!: string;

  @IsOptional()
  @IsIn(["FREE", "PAID"])
  pricingType?: "FREE" | "PAID";

  @IsOptional()
  @IsInt()
  @Min(0)
  priceCents?: number;

  @IsOptional()
  @IsString()
  currency?: string;
}
