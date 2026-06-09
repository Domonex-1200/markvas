import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import bcrypt from "bcrypt";
import { Repository } from "typeorm";
import type { AuthTokens, CurrentUser } from "../common/types";
import { User } from "../users/user.entity";
import { LoginDto, RegisterDto } from "./dto";
import type { JwtPayload } from "./jwt.strategy";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  async register(dto: RegisterDto): Promise<{ user: CurrentUser; tokens: AuthTokens }> {
    const existing = await this.users.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException("Email already registered.");

    const user = this.users.create({
      email: dto.email.toLowerCase(),
      password: await bcrypt.hash(dto.password, 12),
      role: "USER"
    });
    await this.users.save(user);
    const tokens = await this.issueTokens(user);
    return { user: toCurrentUser(user), tokens };
  }

  async login(dto: LoginDto): Promise<{ user: CurrentUser; tokens: AuthTokens }> {
    const user = await this.users.findOne({ where: { email: dto.email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) throw new UnauthorizedException("Invalid credentials.");
    const tokens = await this.issueTokens(user);
    return { user: toCurrentUser(user), tokens };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
      secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET")
    });
    const user = await this.users.findOne({ where: { id: payload.sub } });
    if (!user?.refreshTokenHash || !(await bcrypt.compare(refreshToken, user.refreshTokenHash))) {
      throw new UnauthorizedException("Invalid refresh token.");
    }
    return this.issueTokens(user);
  }

  async me(userId: string): Promise<CurrentUser> {
    const user = await this.users.findOneByOrFail({ id: userId });
    return toCurrentUser(user);
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
        expiresIn: this.config.get<string>("JWT_ACCESS_TTL", "900s")
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
        expiresIn: this.config.get<string>("JWT_REFRESH_TTL", "30d")
      })
    ]);

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    await this.users.save(user);
    return { accessToken, refreshToken };
  }
}

function toCurrentUser(user: User): CurrentUser {
  return { id: user.id, email: user.email, role: user.role };
}
