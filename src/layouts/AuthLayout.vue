<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="auth-layout">
        <div class="auth-layout__grid">
          <section class="auth-layout__form">
            <div class="auth-layout__form-inner">
              <div class="auth-layout__brand">
                <img class="auth-layout__mark q-mx-auto" :src="mark" alt="" aria-hidden="true" />
              </div>

              <router-view />
            </div>
          </section>

          <aside class="auth-layout__visual">
            <img
              class="auth-layout__visual-img"
              :src="poster"
              alt="Drum major de una banda de desfile junto a trompetistas, fotografía de archivo de 1960"
              decoding="async"
            />

            <div class="auth-layout__visual-content">
              <div class="auth-layout__visual-eyebrow">Welcome to</div>
              <h2 class="auth-layout__visual-title">The Black Parade</h2>
              <p class="auth-layout__visual-text">
                Compras, caos y corazones rotos. Entrá a la banda y llevate el show a casa.
              </p>
              <div class="auth-layout__visual-meta">MCR · 2006 · We'll carry on.</div>
            </div>
          </aside>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import mark from '../assets/black-parade-mark.svg'
import poster from '../assets/drum-major.jpg'
</script>

<style lang="scss" scoped>
.auth-layout {
  min-height: 100vh;
  background: #ffffff;
}

.auth-layout__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.08fr);
  min-height: 100vh;
}

.auth-layout__form {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 22px;
}

.auth-layout__form-inner {
  width: 100%;
  max-width: 360px;
}

.auth-layout__brand {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-bottom: 46px;
  color: #171412;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.auth-layout__mark {
  width: 25px;
  height: 25px;
}

.auth-layout__credit {
  margin-top: 28px;
  color: #7d766e;
  font-size: 9px;
  line-height: 1.5;
  letter-spacing: 0.02em;
  text-align: center;
}

.auth-layout__credit a {
  color: #5d5751;
  text-decoration: none;
}

.auth-layout__credit a:hover {
  color: $primary;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.auth-layout__visual {
  position: relative;
  overflow: hidden;
  background: #121214;
  isolation: isolate;
}

.auth-layout__visual::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background: $primary;
  mix-blend-mode: multiply;
  opacity: 0.3;
}

.auth-layout__visual::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    180deg,
    rgba(10, 10, 11, 0.25) 0%,
    rgba(10, 10, 11, 0.15) 40%,
    rgba(10, 10, 11, 0.92) 100%
  );
}

.auth-layout__visual-img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
  filter: grayscale(1) contrast(1.15) brightness(0.72);
}

.auth-layout__visual-content {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2;
  max-width: 520px;
  padding: 48px;
}

.auth-layout__visual-eyebrow {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #e05a6e;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.auth-layout__visual-eyebrow::before {
  content: '';
  width: 20px;
  height: 1px;
  background: #e05a6e;
}

.auth-layout__visual-title {
  margin: 10px 0 0;
  color: #f4f1ea;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 40px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.08;
}

.auth-layout__visual-text {
  max-width: 380px;
  margin: 14px 0 0;
  color: rgba(244, 241, 234, 0.72);
  font-size: 14px;
  line-height: 1.6;
}

.auth-layout__visual-meta {
  margin-top: 22px;
  color: rgba(244, 241, 234, 0.45);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

:deep(.auth-form) {
  width: 100%;
}

:deep(.auth-form__eyebrow) {
  display: flex;
  align-items: center;
  gap: 8px;
  color: $primary;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

:deep(.auth-form__eyebrow::before) {
  content: '';
  width: 16px;
  height: 1px;
  background: $primary;
}

:deep(.auth-form__title) {
  margin: 8px 0 0;
  color: #171412;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 30px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.15;
}

:deep(.auth-form__subtitle) {
  margin: 8px 0 0;
  color: #6f6862;
  font-size: 13px;
  line-height: 1.5;
}

:deep(.auth-form .q-field--outlined .q-field__control) {
  border-radius: 8px;
  background: #ffffff;
}

:deep(.auth-form .q-field--outlined .q-field__control::before) {
  border-color: #e5e7eb;
  border-radius: 8px;
}

:deep(.auth-form .q-field--outlined:not(.q-field--highlighted) .q-field__control:hover::before) {
  border-color: #d1d5db;
}

:deep(.auth-form .q-field--outlined .q-field__control::after) {
  border-radius: 8px;
}

:deep(.auth-form .q-field__label) {
  color: #6f6862;
  font-size: 12.5px;
}

:deep(.auth-form .q-field__native),
:deep(.auth-form .q-field__input) {
  color: #171412;
  font-size: 13px;
}

:deep(.auth-form .q-field__marginal) {
  color: #6f6862;
}

:deep(.auth-form .q-field__bottom) {
  color: #6f6862;
  font-size: 10.5px;
}

:deep(.auth-form .q-field--error .q-field__bottom) {
  color: #b3261e;
}

:deep(.auth-form input:-webkit-autofill) {
  -webkit-text-fill-color: #171412;
  -webkit-box-shadow: 0 0 0 1000px #ffffff inset;
  transition: background-color 9999s ease-out;
}

:deep(.auth-form .q-checkbox__label) {
  color: #5d5751;
  font-size: 12px;
  line-height: 1.4;
}

:deep(.auth-form__submit) {
  height: 44px;
  border-radius: 8px;
  background: #171412;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

:deep(.auth-form__submit:hover) {
  background: $primary;
}

:deep(.auth-form__submit:active) {
  transform: translateY(1px);
}

:deep(.auth-form__footer) {
  margin-top: 24px;
  color: #6f6862;
  font-size: 12.5px;
  text-align: center;
}

:deep(.auth-form__link) {
  color: $primary;
  font-weight: 600;
  text-decoration: none;
}

:deep(.auth-form__link:hover) {
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (max-width: 899px) {
  .auth-layout__grid {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .auth-layout__visual {
    order: -1;
    flex: 0 0 128px;
    height: 128px;
  }

  .auth-layout__visual-content {
    max-width: none;
    padding: 16px 20px;
  }

  .auth-layout__visual-title {
    margin-top: 4px;
    font-size: 22px;
  }

  .auth-layout__visual-text,
  .auth-layout__visual-meta {
    display: none;
  }

  .auth-layout__form {
    flex: 1 1 auto;
    align-items: flex-start;
    padding: 28px 20px 40px;
  }

  .auth-layout__form-inner {
    max-width: 380px;
  }

  .auth-layout__brand {
    margin-bottom: 28px;
  }
}
</style>
