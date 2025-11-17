import React from 'react';
import { BFCard, BFCardHeader, BFCardContent } from '../components/BF-Card';
import { BFBadge } from '../components/BF-Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export const DevHandoff: React.FC = () => {
  return (
    <div className="space-y-6 pb-12" data-test="dev-handoff">
      <div>
        <h1 className="text-[--foreground] mb-2">Dev Handoff - Vue.js 3</h1>
        <p className="text-[--muted-foreground]">
          Especificações completas para implementação em Vue 3 com Composition API
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="tokens">Design Tokens</TabsTrigger>
          <TabsTrigger value="components">Componentes</TabsTrigger>
          <TabsTrigger value="pages">Páginas</TabsTrigger>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <BFCard variant="elevated" padding="lg">
            <BFCardHeader title="Arquitetura do Projeto" />
            <BFCardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-[--foreground] mb-2">Stack Tecnológica</h3>
                  <ul className="list-disc list-inside space-y-2 text-[--muted-foreground]">
                    <li><strong>Vue 3.4+</strong> com Composition API e {'<script setup>'}</li>
                    <li><strong>TypeScript 5+</strong> para type safety</li>
                    <li><strong>Tailwind CSS 4</strong> para estilização</li>
                    <li><strong>Vite</strong> como build tool</li>
                    <li><strong>Vue Router 4</strong> para roteamento</li>
                    <li><strong>Pinia</strong> para gerenciamento de estado</li>
                    <li><strong>Vitest</strong> + <strong>Vue Test Utils</strong> para testes</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-[--foreground] mb-2">Estrutura de Diretórios</h3>
                  <pre className="bg-[--muted] p-4 rounded-lg overflow-x-auto">
{`bot-fut/
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── globals.css
│   ├── components/
│   │   ├── atomic/
│   │   │   ├── BFButton.vue
│   │   │   ├── BFCard.vue
│   │   │   ├── BFInput.vue
│   │   │   ├── BFBadge.vue
│   │   │   └── BFTable.vue
│   │   ├── layout/
│   │   │   ├── BFSidebar.vue
│   │   │   ├── BFHeader.vue
│   │   │   └── BFLayout.vue
│   │   └── icons/
│   │       ├── BFLogo.vue
│   │       └── BFIcon.vue
│   ├── composables/
│   │   ├── useAuth.ts
│   │   ├── useDebts.ts
│   │   └── useGames.ts
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── DashboardView.vue
│   │   │   ├── GamesView.vue
│   │   │   ├── PlayersView.vue
│   │   │   └── DebtsView.vue
│   │   └── user/
│   │       ├── DashboardView.vue
│   │       └── ProfileView.vue
│   ├── stores/
│   │   ├── auth.ts
│   │   ├── games.ts
│   │   └── debts.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── formatters.ts
│   ├── App.vue
│   ├── main.ts
│   └── router.ts
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
└── package.json`}
                  </pre>
                </div>

                <div>
                  <h3 className="text-[--foreground] mb-2">Roles e Permissões</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[--accent] rounded-lg">
                      <h4 className="text-[--foreground] mb-2 flex items-center gap-2">
                        <BFBadge variant="primary">Admin</BFBadge>
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-[--muted-foreground]">
                        <li>Dashboard administrativo completo</li>
                        <li>Gerenciar jogos (CRUD)</li>
                        <li>Gerenciar jogadores (CRUD)</li>
                        <li>Gerenciar débitos</li>
                        <li>Executar comandos do bot</li>
                        <li>Visualizar relatórios</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-[--accent] rounded-lg">
                      <h4 className="text-[--foreground] mb-2 flex items-center gap-2">
                        <BFBadge variant="info">User</BFBadge>
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-[--muted-foreground]">
                        <li>Dashboard pessoal</li>
                        <li>Consultar débitos próprios</li>
                        <li>Visualizar histórico de pagamentos</li>
                        <li>Ver próximos jogos</li>
                        <li>Atualizar perfil pessoal</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </BFCardContent>
          </BFCard>

          <BFCard variant="elevated" padding="lg">
            <BFCardHeader title="Breakpoints Responsivos" />
            <BFCardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[--accent] rounded-lg">
                  <div>
                    <p className="text-[--foreground]">Mobile</p>
                    <p className="text-[--muted-foreground]">≤ 767px</p>
                  </div>
                  <BFBadge variant="info">sm</BFBadge>
                </div>
                <div className="flex items-center justify-between p-3 bg-[--accent] rounded-lg">
                  <div>
                    <p className="text-[--foreground]">Tablet</p>
                    <p className="text-[--muted-foreground]">768px - 1199px</p>
                  </div>
                  <BFBadge variant="primary">md</BFBadge>
                </div>
                <div className="flex items-center justify-between p-3 bg-[--accent] rounded-lg">
                  <div>
                    <p className="text-[--foreground]">Desktop</p>
                    <p className="text-[--muted-foreground]">≥ 1200px</p>
                  </div>
                  <BFBadge variant="success">lg</BFBadge>
                </div>
              </div>
            </BFCardContent>
          </BFCard>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-6">
          <BFCard variant="elevated" padding="lg">
            <BFCardHeader title="Design Tokens - globals.css" />
            <BFCardContent>
              <pre className="bg-[--muted] p-4 rounded-lg overflow-x-auto text-sm">
{`:root {
  /* Brand Colors - Sporty & Modern */
  --bf-green-primary: #00D66F;
  --bf-green-dark: #00A854;
  --bf-green-light: #4DFFB3;
  --bf-blue-primary: #0066FF;
  --bf-blue-dark: #0047B3;
  --bf-navy: #0A1628;
  --bf-navy-light: #1A2B42;
  
  /* Base Colors */
  --background: #F5F7FA;
  --foreground: #0A1628;
  --card: #ffffff;
  --card-foreground: #0A1628;
  
  /* Primary - Green for success/actions */
  --primary: #00D66F;
  --primary-foreground: #ffffff;
  
  /* Secondary - Blue for information */
  --secondary: #0066FF;
  --secondary-foreground: #ffffff;
  
  /* Status colors */
  --destructive: #EF4444;
  --success: #00D66F;
  --warning: #F59E0B;
  --info: #0066FF;
  
  /* Spacing scale */
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  --spacing-2xl: 3rem;     /* 48px */
  
  /* Border radius */
  --radius-sm: 0.375rem;   /* 6px */
  --radius-md: 0.5rem;     /* 8px */
  --radius-lg: 0.75rem;    /* 12px */
  --radius-xl: 1rem;       /* 16px */
  --radius-full: 9999px;
  
  /* Typography scale */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
}`}
              </pre>
            </BFCardContent>
          </BFCard>

          <BFCard variant="elevated" padding="lg">
            <BFCardHeader title="Tailwind Configuration" />
            <BFCardContent>
              <pre className="bg-[--muted] p-4 rounded-lg overflow-x-auto text-sm">
{`// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: 'var(--destructive)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        info: 'var(--info)',
      },
      spacing: {
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
        xl: 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      screens: {
        sm: '768px',
        md: '768px',
        lg: '1200px',
      },
    },
  },
  plugins: [],
}`}
              </pre>
            </BFCardContent>
          </BFCard>
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          <BFCard variant="elevated" padding="lg">
            <BFCardHeader title="BFButton.vue" subtitle="Componente de botão com variants" />
            <BFCardContent>
              <div className="bg-[--muted] p-4 rounded-lg overflow-x-auto text-sm">
                <pre className="whitespace-pre-wrap break-words">
                  <code>{'<script setup lang="ts">'}</code>
                  {'\n'}import {'{computed}'} from &apos;vue&apos;
                  {'\n\n'}interface Props {'{'}
                  {'\n'}  variant?: &apos;primary&apos; | &apos;secondary&apos; | &apos;outline&apos; | &apos;ghost&apos; | &apos;danger&apos; | &apos;success&apos;
                  {'\n'}  size?: &apos;sm&apos; | &apos;md&apos; | &apos;lg&apos;
                  {'\n'}  fullWidth?: boolean
                  {'\n'}  isLoading?: boolean
                  {'\n'}  disabled?: boolean
                  {'\n'}  dataTest?: string
                  {'\n'}{'}'}
                  {'\n\n'}const props = withDefaults(defineProps{'<Props>()'}
                  {'\n\n'}const buttonClasses = computed(() ={'> ['}
                  {'\n'}  &apos;rounded-md inline-flex items-center justify-center&apos;,
                  {'\n'}  &apos;transition-all duration-200&apos;
                  {'\n'}].join(&apos; &apos;))
                  {'\n'}<code>{'</script>'}</code>
                  {'\n\n'}<code>{'<template>'}</code>
                  {'\n'}  <code>{'<button :class="buttonClasses" @click="emit(\'click\', $event)">'}</code>
                  {'\n'}    <code>{'<slot />'}</code>
                  {'\n'}  <code>{'</button>'}</code>
                  {'\n'}<code>{'</template>'}</code>
                </pre>
              </div>
              <p className="mt-4 text-[--muted-foreground]">
                Ver IMPLEMENTATION-GUIDE.md para código completo
              </p>
            </BFCardContent>
          </BFCard>

          <BFCard variant="elevated" padding="lg">
            <BFCardHeader title="BFInput.vue" subtitle="Componente de input com validação" />
            <BFCardContent>
              <div className="bg-[--muted] p-4 rounded-lg overflow-x-auto text-sm">
                <pre className="whitespace-pre-wrap break-words">
                  <code>{'<script setup lang="ts">'}</code>
                  {'\n'}import {'{computed}'} from &apos;vue&apos;
                  {'\n\n'}interface Props {'{'}
                  {'\n'}  modelValue: string
                  {'\n'}  label?: string
                  {'\n'}  error?: string
                  {'\n'}  fullWidth?: boolean
                  {'\n'}{'}'}
                  {'\n\n'}const inputClasses = computed(() ={'> ['}
                  {'\n'}  &apos;border rounded-md px-4 py-2&apos;,
                  {'\n'}  props.error ? &apos;border-red-500&apos; : &apos;border-gray-300&apos;
                  {'\n'}].join(&apos; &apos;))
                  {'\n'}<code>{'</script>'}</code>
                  {'\n\n'}<code>{'<template>'}</code>
                  {'\n'}  <code>{'<div>'}</code>
                  {'\n'}    <code>{'<input :class="inputClasses" v-model="modelValue" />'}</code>
                  {'\n'}  <code>{'</div>'}</code>
                  {'\n'}<code>{'</template>'}</code>
                </pre>
              </div>
              <p className="mt-4 text-[--muted-foreground]">
                Ver IMPLEMENTATION-GUIDE.md para código completo
              </p>
            </BFCardContent>
          </BFCard>
        </TabsContent>

        <TabsContent value="pages" className="space-y-6">
          <BFCard variant="elevated" padding="lg">
            <BFCardHeader title="Páginas Implementadas" />
            <BFCardContent>
              <div className="space-y-3">
                <div className="p-4 bg-[--accent] rounded-lg border border-[--border]">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[--foreground]">Dashboard Admin</h4>
                    <BFBadge variant="primary">Admin</BFBadge>
                  </div>
                  <p className="text-[--muted-foreground] mb-2">
                    <strong>Route:</strong> /admin/dashboard
                  </p>
                  <p className="text-[--muted-foreground]">
                    Visão geral com estatísticas, gráficos de receita, próximos jogos e débitos recentes.
                  </p>
                </div>

                <div className="p-4 bg-[--accent] rounded-lg border border-[--border]">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[--foreground]">Gerenciar Jogos</h4>
                    <BFBadge variant="primary">Admin</BFBadge>
                  </div>
                  <p className="text-[--muted-foreground] mb-2">
                    <strong>Route:</strong> /admin/games
                  </p>
                  <p className="text-[--muted-foreground]">
                    CRUD completo de jogos com filtros, busca, tabela sortable e formulário de criação.
                  </p>
                </div>

                <div className="p-4 bg-[--accent] rounded-lg border border-[--border]">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[--foreground]">Gerenciar Jogadores</h4>
                    <BFBadge variant="primary">Admin</BFBadge>
                  </div>
                  <p className="text-[--muted-foreground] mb-2">
                    <strong>Route:</strong> /admin/players
                  </p>
                  <p className="text-[--muted-foreground]">
                    Gestão de jogadores com status, débitos, busca e exportação de dados.
                  </p>
                </div>

                <div className="p-4 bg-[--accent] rounded-lg border border-[--border]">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[--foreground]">Gerenciar Débitos</h4>
                    <BFBadge variant="primary">Admin</BFBadge>
                  </div>
                  <p className="text-[--muted-foreground] mb-2">
                    <strong>Route:</strong> /admin/debts
                  </p>
                  <p className="text-[--muted-foreground]">
                    Controle de débitos com registro de pagamentos, lembretes e filtros por status.
                  </p>
                </div>

                <div className="p-4 bg-[--accent] rounded-lg border border-[--border]">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[--foreground]">Painel do Usuário</h4>
                    <BFBadge variant="info">User</BFBadge>
                  </div>
                  <p className="text-[--muted-foreground] mb-2">
                    <strong>Route:</strong> /user/dashboard
                  </p>
                  <p className="text-[--muted-foreground]">
                    Dashboard pessoal com débitos pendentes, próximos jogos e histórico de transações.
                  </p>
                </div>
              </div>
            </BFCardContent>
          </BFCard>
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          <BFCard variant="elevated" padding="lg">
            <BFCardHeader title="Instalação e Setup" />
            <BFCardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-[--foreground] mb-2">1. Criar Projeto Vue 3</h4>
                  <pre className="bg-[--muted] p-4 rounded-lg overflow-x-auto text-sm">
{`npm create vue@latest bot-fut
# Selecionar:
# - TypeScript: Yes
# - Vue Router: Yes
# - Pinia: Yes
# - Vitest: Yes
# - ESLint: Yes

cd bot-fut
npm install`}
                  </pre>
                </div>

                <div>
                  <h4 className="text-[--foreground] mb-2">2. Instalar Dependências</h4>
                  <pre className="bg-[--muted] p-4 rounded-lg overflow-x-auto text-sm">
{`npm install -D tailwindcss@next postcss autoprefixer
npm install lucide-vue-next recharts
npm install @vueuse/core
npx tailwindcss init -p`}
                  </pre>
                </div>

                <div>
                  <h4 className="text-[--foreground] mb-2">3. Configurar Tailwind</h4>
                  <p className="text-[--muted-foreground] mb-2">
                    Adicionar ao <code className="bg-[--muted] px-2 py-1 rounded">src/assets/styles/globals.css</code>:
                  </p>
                  <pre className="bg-[--muted] p-4 rounded-lg overflow-x-auto text-sm">
{`@tailwind base;
@tailwind components;
@tailwind utilities;

/* Design Tokens aqui */`}
                  </pre>
                </div>

                <div>
                  <h4 className="text-[--foreground] mb-2">4. Estrutura de Rotas</h4>
                  <pre className="bg-[--muted] p-4 rounded-lg overflow-x-auto text-sm">
{`// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/admin',
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        { path: 'dashboard', component: () => import('@/pages/admin/DashboardView.vue') },
        { path: 'games', component: () => import('@/pages/admin/GamesView.vue') },
        { path: 'players', component: () => import('@/pages/admin/PlayersView.vue') },
        { path: 'debts', component: () => import('@/pages/admin/DebtsView.vue') },
      ]
    },
    {
      path: '/user',
      meta: { requiresAuth: true, role: 'user' },
      children: [
        { path: 'dashboard', component: () => import('@/pages/user/DashboardView.vue') },
        { path: 'profile', component: () => import('@/pages/user/ProfileView.vue') },
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.role && authStore.user?.role !== to.meta.role) {
    next('/unauthorized')
  } else {
    next()
  }
})

export default router`}
                  </pre>
                </div>
              </div>
            </BFCardContent>
          </BFCard>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <BFCard variant="elevated" padding="lg">
            <BFCardHeader title="Estratégia de Testes" />
            <BFCardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-[--foreground] mb-2">Data-test Attributes</h4>
                  <p className="text-[--muted-foreground] mb-3">
                    Todos os componentes críticos possuem data-test attributes para facilitar testes E2E:
                  </p>
                  <pre className="bg-[--muted] p-4 rounded-lg overflow-x-auto text-sm">
{`// Exemplo de uso nos testes
import { mount } from '@vue/test-utils'
import BFButton from '@/components/atomic/BFButton.vue'

describe('BFButton', () => {
  it('should render with correct variant', () => {
    const wrapper = mount(BFButton, {
      props: {
        variant: 'primary',
        dataTest: 'submit-button'
      },
      slots: {
        default: 'Submit'
      }
    })
    
    expect(wrapper.find('[data-test="submit-button"]').exists()).toBe(true)
    expect(wrapper.text()).toBe('Submit')
  })
  
  it('should emit click event', async () => {
    const wrapper = mount(BFButton, {
      props: { dataTest: 'test-button' }
    })
    
    await wrapper.find('[data-test="test-button"]').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})`}
                  </pre>
                </div>

                <div>
                  <h4 className="text-[--foreground] mb-2">Testes de Integração</h4>
                  <pre className="bg-[--muted] p-4 rounded-lg overflow-x-auto text-sm">
{`// tests/integration/admin-dashboard.spec.ts
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import DashboardView from '@/pages/admin/DashboardView.vue'

describe('Admin Dashboard', () => {
  it('should display stats correctly', () => {
    const wrapper = mount(DashboardView, {
      global: {
        plugins: [createPinia()]
      }
    })
    
    expect(wrapper.find('[data-test="admin-dashboard"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="stat-players"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="stat-games"]').exists()).toBe(true)
  })
})`}
                  </pre>
                </div>

                <div>
                  <h4 className="text-[--foreground] mb-2">Cobertura de Testes Recomendada</h4>
                  <ul className="list-disc list-inside space-y-2 text-[--muted-foreground]">
                    <li>Componentes atômicos: <strong>100%</strong></li>
                    <li>Componentes de layout: <strong>90%</strong></li>
                    <li>Páginas: <strong>80%</strong></li>
                    <li>Stores (Pinia): <strong>100%</strong></li>
                    <li>Composables: <strong>90%</strong></li>
                  </ul>
                </div>
              </div>
            </BFCardContent>
          </BFCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};
