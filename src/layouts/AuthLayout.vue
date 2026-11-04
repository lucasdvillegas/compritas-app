<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="auth-layout">
        <div class="auth-layout__shell">
          <div class="auth-layout__brand">
            <q-avatar color="primary" text-color="white" icon="shopping_basket" size="36px" />
            <span class="auth-layout__wordmark">Compritapp</span>
          </div>

          <q-card flat bordered class="auth-layout__card">
            <q-card-section class="q-pa-lg">
              <router-view />
            </q-card-section>
          </q-card>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style lang="scss" scoped>
.auth-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  background: var(--app-bg);
  color: var(--app-text);
}

.auth-layout__shell {
  width: 100%;
  max-width: 420px;
}

.auth-layout__brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
  color: var(--app-text);
  font-family: var(--app-font-mono);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.auth-layout__wordmark {
  line-height: 1;
}

.auth-layout__card {
  background: var(--app-surface);
  border-color: var(--app-border) !important;
  border-radius: var(--app-radius-lg) !important;
  box-shadow: none !important;
}

:deep(.auth-form) {
  width: 100%;
}

:deep(.auth-form__eyebrow) {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--app-accent);
  font-family: var(--app-font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

:deep(.auth-form__eyebrow::before) {
  content: '';
  width: 16px;
  height: 1px;
  background: var(--app-accent);
}

:deep(.auth-form__title) {
  margin: 8px 0 0;
  color: var(--app-text);
  font-family: var(--app-font-display);
  font-optical-sizing: auto;
  font-size: clamp(1.6rem, 4vw, 2rem);
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.15;
}

:deep(.auth-form__subtitle) {
  margin: 8px 0 0;
  color: var(--app-text-muted);
  font-size: 14px;
  line-height: 1.55;
}

:deep(.auth-form .q-field--outlined .q-field__control) {
  border-radius: var(--app-radius-sm);
  background: var(--app-surface);
}

:deep(.auth-form .q-field--outlined .q-field__control::before) {
  border-color: var(--app-border);
  border-radius: var(--app-radius-sm);
}

:deep(.auth-form .q-field--outlined:not(.q-field--highlighted) .q-field__control:hover::before) {
  border-color: var(--app-text-muted);
}

:deep(.auth-form .q-field--outlined .q-field__control::after) {
  border-radius: var(--app-radius-sm);
}

:deep(.auth-form .q-field__label) {
  color: var(--app-text-muted);
  font-size: 13px;
}

:deep(.auth-form .q-field__native),
:deep(.auth-form .q-field__input) {
  color: var(--app-text);
  font-size: 14px;
}

:deep(.auth-form .q-field__marginal) {
  color: var(--app-text-muted);
}

:deep(.auth-form .q-field__bottom) {
  color: var(--app-text-muted);
  font-size: 11px;
}

:deep(.auth-form .q-field--error .q-field__bottom) {
  color: var(--q-negative);
}

:deep(.auth-form input:-webkit-autofill) {
  -webkit-text-fill-color: var(--app-text);
  -webkit-box-shadow: 0 0 0 1000px var(--app-surface) inset;
  transition: background-color 9999s ease-out;
}

:deep(.auth-form .q-checkbox__label) {
  color: var(--app-text-muted);
  font-size: 13px;
  line-height: 1.4;
}

:deep(.auth-form__submit) {
  height: 46px;
  border-radius: var(--app-radius-sm);
  background: var(--q-primary);
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.01em;
  box-shadow: none;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

:deep(.auth-form__submit:hover) {
  background: #8f2230;
}

:deep(.auth-form__submit:active) {
  transform: translateY(1px);
}

:deep(.auth-form__footer) {
  margin-top: 24px;
  color: var(--app-text-muted);
  font-size: 13px;
  text-align: center;
}

:deep(.auth-form__link) {
  color: var(--q-primary);
  font-weight: 600;
  text-decoration: none;
}

:deep(.auth-form__link:hover) {
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (max-width: 599px) {
  .auth-layout {
    align-items: flex-start;
    padding: 40px 16px 24px;
  }

  :deep(.auth-layout__card .q-card__section) {
    padding: 20px 18px;
  }
}
</style>
