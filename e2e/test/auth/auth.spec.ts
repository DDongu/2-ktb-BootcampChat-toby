import { test, expect } from '@playwright/test';
import { TestHelpers } from '../helpers/test-helpers';

// 테스트의 전체적인 설명을 담는 최상위 describe 블록
test.describe('인증 (Authentication)', () => {
  const helpers = new TestHelpers();

  // =================================================================
  // 1. 회원가입 기능 테스트
  // =================================================================
  test.describe('회원가입', () => {
    
    // --- 회원가입 성공 케이스 (Happy Path) ---
    test('올바른 정보로 가입 후, "지금 이동하기" 버튼으로 즉시 이동해야 한다', async ({ page }) => {
      await page.goto('/register');
      const user = helpers.generateUserCredentials(1);

      // 1. 사용자 정보 입력
      await page.locator('input[name="name"]').fill(user.name);
      await page.locator('input[name="email"]').fill(user.email);
      await page.locator('input[name="password"]').fill(user.password);
      await page.locator('input[name="confirmPassword"]').fill(user.password);

      // 2. '회원가입' 버튼 클릭
      await page.getByRole('button', { name: '회원가입' }).click();

      // 3. 회원가입 성공 모달이 나타나는지 확인
      const successModal = page.locator('.modal.show');
      await expect(successModal).toBeVisible({ timeout: 10000 });

      // 4. 모달 내의 내용을 검증하고 '지금 이동하기' 버튼 클릭
      await expect(successModal.getByRole('heading', { name: '회원가입 성공' })).toBeVisible();
      await expect(successModal.getByText('회원가입을 축하합니다!')).toBeVisible();
      await successModal.getByRole('button', { name: '지금 이동하기' }).click();

      // 5. 채팅방 페이지로 정상적으로 이동했는지 최종 검증
      await expect(page).toHaveURL('/chat-rooms', { timeout: 10000 });
      
      // [수정] 로딩 인디케이터가 사라질 때까지 기다립니다.
      // 이것이 로딩이 완료되었다는 가장 명확한 신호입니다.
      await expect(page.locator('.loading-indicator')).not.toBeVisible({ timeout: 15000 });

      // 이제 페이지가 완전히 로드되었으므로, 나머지 요소들을 검증합니다.
      await expect(page.getByText('연결됨')).toBeVisible();
      await expect(page.locator('.chat-rooms-table')).toBeVisible();
    });

    test('올바른 정보로 가입 후, 10초 뒤 자동으로 이동해야 한다', async ({ page }) => {
      await page.goto('/register');
      const user = helpers.generateUserCredentials(2);

      // 1. 사용자 정보 입력
      await page.locator('input[name="name"]').fill(user.name);
      await page.locator('input[name="email"]').fill(user.email);
      await page.locator('input[name="password"]').fill(user.password);
      await page.locator('input[name="confirmPassword"]').fill(user.password);

      // 2. '회원가입' 버튼 클릭
      await page.getByRole('button', { name: '회원가입' }).click();

      // 3. 회원가입 성공 모달 및 자동 이동 안내 문구 확인
      const successModal = page.locator('.modal.show');
      await expect(successModal).toBeVisible({ timeout: 10000 });
      await expect(successModal.getByText('10초 후 채팅방 목록으로 이동합니다.')).toBeVisible();

      // 4. URL이 변경될 때까지 기다립니다.
      await expect(page).toHaveURL('/chat-rooms', { timeout: 15000 });

      // 5. 페이지 이동 후 로딩이 완료되었는지 확인
      await expect(page.locator('.loading-indicator')).not.toBeVisible({ timeout: 15000 });
    });

    // --- 회원가입 예외 처리 및 유효성 검사 ---
    test.describe('유효성 검사', () => {
      test.beforeEach(async ({ page }) => {
        await page.goto('/register');
      });

      test('이름을 입력하지 않으면 가입이 실패해야 한다', async ({ page }) => {
        const submitButton = page.getByRole('button', { name: '회원가입' });
        // [수정] button 타입을 HTMLButtonElement로 명시하여 타입 에러를 해결합니다.
        await submitButton.evaluate(button => (button as HTMLButtonElement).formNoValidate = true);
        await submitButton.click();
        
        // 검증: 페이지가 이동되지 않고, 성공 모달도 나타나지 않아야 함
        await expect(page).toHaveURL('/register');
        await expect(page.locator('.modal.show')).not.toBeVisible();
      });

      test('잘못된 이메일 형식으로는 가입이 실패해야 한다', async ({ page }) => {
        await page.locator('input[name="email"]').fill('invalid-email');
        
        const submitButton = page.getByRole('button', { name: '회원가입' });
        // [수정] button 타입을 HTMLButtonElement로 명시하여 타입 에러를 해결합니다.
        await submitButton.evaluate(button => (button as HTMLButtonElement).formNoValidate = true);
        await submitButton.click();
        
        // 검증: 페이지가 이동되지 않고, 성공 모달도 나타나지 않아야 함
        await expect(page).toHaveURL('/register');
        await expect(page.locator('.modal.show')).not.toBeVisible();
      });

      test('비밀번호가 6자 미만이면 가입이 실패해야 한다', async ({ page }) => {
        await page.locator('input[name="password"]').fill('12345');
        
        const submitButton = page.getByRole('button', { name: '회원가입' });
        // [수정] button 타입을 HTMLButtonElement로 명시하여 타입 에러를 해결합니다.
        await submitButton.evaluate(button => (button as HTMLButtonElement).formNoValidate = true);
        await submitButton.click();
        
        // 검증: 페이지가 이동되지 않고, 성공 모달도 나타나지 않아야 함
        await expect(page).toHaveURL('/register');
        await expect(page.locator('.modal.show')).not.toBeVisible();
      });
      
      test('비밀번호와 확인이 일치하지 않으면 가입이 실패해야 한다', async ({ page }) => {
        await page.locator('input[name="password"]').fill('password123');
        await page.locator('input[name="confirmPassword"]').fill('password456');
        
        const submitButton = page.getByRole('button', { name: '회원가입' });
        // [수정] button 타입을 HTMLButtonElement로 명시하여 타입 에러를 해결합니다.
        await submitButton.evaluate(button => (button as HTMLButtonElement).formNoValidate = true);
        await submitButton.click();
        
        // 검증: 페이지가 이동되지 않고, 성공 모달도 나타나지 않아야 함
        await expect(page).toHaveURL('/register');
        await expect(page.locator('.modal.show')).not.toBeVisible();
      });
    });
  });

  // =================================================================
  // 2. 로그인 기능 테스트
  // =================================================================
  test.describe('로그인', () => {
    let testUser = { name:'Test User 1',email: 'testuser1@example.com', password: 'password123!' };

    // 로그인 테스트를 위해, 모든 테스트 시작 전 테스트용 계정을 미리 생성
    test.beforeAll(async ({ browser }) => {
      testUser = helpers.generateUserCredentials(10);
      const page = await browser.newPage();
      await helpers.registerUser(page, testUser);
      await page.close();
    });

    // --- 로그인 성공 케이스 ---
    test('올바른 정보로 로그인 시 채팅방 페이지로 이동해야 한다', async ({ page }) => {
      await page.goto('/');

      await page.locator('input[name="email"]').fill(testUser.email);
      await page.locator('input[name="password"]').fill(testUser.password);
      await page.getByRole('button', { name: '로그인' }).click();

      await expect(page).toHaveURL('/chat-rooms', { timeout: 10000 });
      
      // [수정] 로딩 인디케이터가 사라질 때까지 기다립니다.
      await expect(page.locator('.loading-indicator')).not.toBeVisible({ timeout: 15000 });
      // 이제 페이지가 완전히 로드되었으므로, 나머지 요소들을 검증합니다.
      await expect(page.getByText('연결됨')).toBeVisible();
      await expect(page.locator('.chat-rooms-table')).toBeVisible();
    });
    
    // --- 로그인 실패 케이스 ---
    test('잘못된 비밀번호로 로그인 시 페이지 이동이 없어야 한다', async ({ page }) => {
        await page.goto('/');

        await page.locator('input[name="email"]').fill(testUser.email);
        await page.locator('input[name="password"]').fill('this-is-wrong-password');
        
        const submitButton = page.getByRole('button', { name: '로그인' });
        // [수정] button 타입을 HTMLButtonElement로 명시하여 타입 에러를 해결합니다.
        await submitButton.evaluate(button => (button as HTMLButtonElement).formNoValidate = true);
        await submitButton.click();

        // 검증: 페이지가 채팅방 목록으로 이동하지 않았는지 확인
        await expect(page).not.toHaveURL('/chat-rooms');
    });
  });
});
