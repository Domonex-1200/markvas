import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { Roles } from "../common/roles.decorator";
import { RolesGuard } from "../common/roles.guard";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { JwtPayload } from "../auth/jwt.strategy";
import { AssetsService } from "./assets.service";
import { CreateAssetDto } from "./dto";

@Controller("assets")
export class AssetsController {
  constructor(private readonly assets: AssetsService) {}

  @Get()
  list() {
    return this.assets.list();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Get("admin/review")
  listForReview(@Req() request: { user: JwtPayload }) {
    return this.assets.listForReview(request.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me/installed")
  installed(@Req() request: { user: JwtPayload }) {
    return this.assets.installedByUser(request.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me/entitlements")
  entitlements(@Req() request: { user: JwtPayload }) {
    return this.assets.entitlementsByUser(request.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me/wishlist")
  wishlist(@Req() request: { user: JwtPayload }) {
    return this.assets.wishlistByUser(request.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me/cart")
  cart(@Req() request: { user: JwtPayload }) {
    return this.assets.cartByUser(request.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post("me/cart/checkout-free")
  checkoutFreeCart(@Req() request: { user: JwtPayload }) {
    return this.assets.checkoutFreeCart(request.user.sub);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.assets.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("DEVELOPER", "ADMIN")
  @Post()
  create(@Req() request: { user: JwtPayload }, @Body() dto: CreateAssetDto) {
    return this.assets.create(request.user.sub, request.user.role, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("DEVELOPER", "ADMIN")
  @Post(":id/submit-review")
  submitForReview(@Req() request: { user: JwtPayload }, @Param("id") id: string) {
    return this.assets.submitForReview(request.user.sub, request.user.role, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Post(":id/approve")
  approve(@Req() request: { user: JwtPayload }, @Param("id") id: string) {
    return this.assets.approve(request.user.role, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Post(":id/reject")
  reject(@Req() request: { user: JwtPayload }, @Param("id") id: string) {
    return this.assets.reject(request.user.role, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/install")
  install(@Req() request: { user: JwtPayload }, @Param("id") id: string) {
    return this.assets.install(request.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/wishlist")
  addWishlist(@Req() request: { user: JwtPayload }, @Param("id") id: string) {
    return this.assets.addToWishlist(request.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id/wishlist")
  removeWishlist(@Req() request: { user: JwtPayload }, @Param("id") id: string) {
    return this.assets.removeFromWishlist(request.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/cart")
  addCart(@Req() request: { user: JwtPayload }, @Param("id") id: string) {
    return this.assets.addToCart(request.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id/cart")
  removeCart(@Req() request: { user: JwtPayload }, @Param("id") id: string) {
    return this.assets.removeFromCart(request.user.sub, id);
  }
}
