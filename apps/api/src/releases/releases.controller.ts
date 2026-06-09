import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import type { AppRelease, AppReleaseChannel, AppReleasePlatform, CurrentUser } from "../common/types";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateAppReleaseDto } from "./dto";
import { ReleasesService } from "./releases.service";

interface AuthenticatedRequest extends Request {
  user: CurrentUser;
}

@Controller("app/releases")
export class ReleasesController {
  constructor(private readonly releases: ReleasesService) {}

  @Get()
  list(): Promise<AppRelease[]> {
    return this.releases.list();
  }

  @Get("latest")
  latest(@Query("platform") platform: AppReleasePlatform, @Query("channel") channel: AppReleaseChannel = "stable"): Promise<AppRelease> {
    return this.releases.latest(platform, channel);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() request: AuthenticatedRequest, @Body() dto: CreateAppReleaseDto): Promise<AppRelease> {
    return this.releases.create(request.user.role, dto);
  }
}
