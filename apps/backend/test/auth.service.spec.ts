import * as bcrypt from 'bcryptjs';

describe('AuthService Password Hashing & Comparison', () => {
  it('should correctly hash and verify password with bcryptjs', async () => {
    const rawPassword = 'Admin123!';
    const hash = await bcrypt.hash(rawPassword, 10);
    const isValid = await bcrypt.compare(rawPassword, hash);
    expect(isValid).toBe(true);
  });
});
