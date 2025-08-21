<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useCartStore } from '~/stores/cart'
import { orderSchemas, type OrderCreateInput } from '~~/shared/validation/schemas'
import { toastService } from '~/services/toastService'
import { PaymentMethod, PAYMENT_METHOD_CONFIG } from '~~/shared/constants/orderConstants'
import type { Form } from '#ui/types'
import type { FetchError } from 'ofetch'

// Тип для ответа сервера после создания заказа
interface OrderCreationResponse {
  id: number;
}

const cart = useCartStore()
const isLoading = ref(false)
const step = ref(0)
const createdOrder = ref<OrderCreationResponse | null>(null);
const formRef = ref<Form<Omit<OrderCreateInput, 'items'>> | null>(null)

const steps = [
  { 
    key: 'cart',
    label: 'Кошик',
    description: 'Перевірте ваші товари'
  },
  { 
    key: 'checkout',
    label: 'Оформлення',
    description: 'Заповніть контактні дані'
  },
  { 
    key: 'success',
    label: 'Підтвердження',
    description: 'Замовлення створено'
  },
]

const paymentOptions = computed(() => {
  return Object.values(PaymentMethod).map(method => ({
    value: method,
    label: PAYMENT_METHOD_CONFIG[method].label,
    description: PAYMENT_METHOD_CONFIG[method].description
  }))
})

const formState = reactive<Omit<OrderCreateInput, 'items'>>({
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  deliveryAddress: '',
  paymentMethod: PaymentMethod.CASH,
})

async function handleCreateOrder() {
  if (cart.isEmpty) {
    toastService.genericError('Неможливо створити замовлення з порожнім кошиком.')
    return
  }

  isLoading.value = true
  const orderPayload: OrderCreateInput = {
    ...formState,
    items: cart.items.map(item => ({ productId: item.id, quantity: item.quantity })),
  }

  try {
    const result = await $fetch<OrderCreationResponse>('/api/users/orders', {
      method: 'POST',
      body: orderPayload,
    })
    createdOrder.value = result;
    toastService.orderCreateSuccess(String(result.id))
    cart.clearCart()
    step.value = 2;

  } catch (e) {
    const error = e as FetchError
    const errorMessage = error.data?.message || 'Не вдалося створити замовлення.'
    toastService.genericError(errorMessage)
  } finally {
    isLoading.value = false
  }
}

function onCheckout() {
  if (cart.isEmpty) {
    toastService.genericError('Ваш кошик порожній.');
    return;
  }
  step.value = 1;
}

function goBack() {
  if (step.value > 0) {
    step.value--
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- Stepper Header -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-8 text-center">Оформлення замовлення</h1>
        <UStepper 
          v-model="step" 
          :items="steps" 
          class="mb-4"
          disabled
        />
      </div>

      <!-- Content Container -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <!-- Шаг 1: Корзина -->
        <div v-if="step === 0" class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-semibold text-gray-900">Ваш кошик</h2>
            <UBadge v-if="!cart.isEmpty" :label="`${cart.items.length} товарів`" color="primary" variant="subtle" />
          </div>

          <div v-if="cart.isEmpty" class="text-center py-16">
            <div class="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <UIcon name="i-heroicons-shopping-bag" class="w-12 h-12 text-gray-400" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Ваш кошик порожній</h3>
            <p class="text-gray-500 mb-6">Додайте товари з нашого меню</p>
            <UButton to="/" color="primary" size="lg">
              Переглянути меню
            </UButton>
          </div>

          <template v-else>
            <!-- Mobile Card Layout -->
            <div class="block sm:hidden space-y-4">
              <UCard v-for="item in cart.items" :key="item.id" class="overflow-hidden">
                <template #header>
                  <div class="flex justify-between items-start">
                    <h3 class="font-semibold text-gray-900">{{ item.name }}</h3>
                    <UButton 
                      variant="ghost" 
                      color="error" 
                      icon="i-heroicons-trash" 
                      size="sm" 
                      @click="cart.removeFromCart(item.id)"
                    />
                  </div>
                </template>
                
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-500">Кількість</span>
                    <div class="flex items-center gap-2">
                      <UButton 
                        variant="outline" 
                        icon="i-heroicons-minus" 
                        size="xs" 
                        :disabled="item.quantity <= 1"
                        @click="cart.changeQuantity(item.id, -1)" 
                      />
                      <span class="min-w-[2rem] text-center font-medium">{{ item.quantity }}</span>
                      <UButton 
                        variant="outline" 
                        icon="i-heroicons-plus" 
                        size="xs" 
                        @click="cart.changeQuantity(item.id, 1)" 
                      />
                    </div>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">Ціна за одиницю</span>
                    <span class="font-medium">{{ item.price }} ₴</span>
                  </div>
                  <div class="flex justify-between items-center pt-2 border-t">
                    <span class="font-semibold">Всього</span>
                    <span class="font-bold text-lg text-primary-600">{{ item.price * item.quantity }} ₴</span>
                  </div>
                </div>
              </UCard>
            </div>

            <!-- Desktop Table Layout -->
            <div class="hidden sm:block overflow-x-auto">
              <table class="min-w-full">
                <thead>
                  <tr class="border-b border-gray-200">
                    <th class="px-4 py-3 text-left font-semibold text-gray-900">Товар</th>
                    <th class="px-4 py-3 text-center font-semibold text-gray-900">Кількість</th>
                    <th class="px-4 py-3 text-center font-semibold text-gray-900">Ціна за од.</th>
                    <th class="px-4 py-3 text-center font-semibold text-gray-900">Всього</th>
                    <th class="px-4 py-3 text-center font-semibold text-gray-900">Дії</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in cart.items" :key="item.id" class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-4">
                      <div class="font-medium text-gray-900">{{ item.name }}</div>
                    </td>
                    <td class="px-4 py-4 text-center">
                      <div class="flex items-center justify-center gap-2">
                        <UButton 
                          variant="outline" 
                          icon="i-heroicons-minus" 
                          size="xs"
                          :disabled="item.quantity <= 1"
                          @click="cart.changeQuantity(item.id, -1)" 
                        />
                        <span class="min-w-[2rem] font-medium">{{ item.quantity }}</span>
                        <UButton 
                          variant="outline" 
                          icon="i-heroicons-plus" 
                          size="xs" 
                          @click="cart.changeQuantity(item.id, 1)" 
                        />
                      </div>
                    </td>
                    <td class="px-4 py-4 text-center font-medium">{{ item.price }} ₴</td>
                    <td class="px-4 py-4 text-center font-bold text-primary-600">{{ item.price * item.quantity }} ₴</td>
                    <td class="px-4 py-4 text-center">
                      <UButton 
                        variant="ghost" 
                        color="error" 
                        icon="i-heroicons-trash" 
                        size="sm" 
                        @click="cart.removeFromCart(item.id)"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Total and Checkout Button -->
            <div class="mt-8 pt-6 border-t border-gray-200">
              <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div class="text-center sm:text-right">
                  <div class="text-sm text-gray-500 mb-1">До сплати</div>
                  <div class="text-3xl font-bold text-gray-900">{{ cart.totalPrice }} ₴</div>
                </div>
                <UButton
                  color="primary"
                  size="xl"
                  class="w-full sm:w-auto px-8"
                  @click="onCheckout"
                  :disabled="cart.isEmpty"
                >
                  Оформити замовлення
                  <UIcon name="i-heroicons-arrow-right" class="ml-2" />
                </UButton>
              </div>
            </div>
          </template>
        </div>

        <!-- Шаг 2: Форма оформления -->
        <div v-else-if="step === 1" class="p-6">
          <div class="mb-6">
            <h2 class="text-2xl font-semibold text-gray-900 mb-2">Контактні дані</h2>
            <p class="text-gray-600">Заповніть форму для оформлення замовлення</p>
          </div>

          <UForm 
            ref="formRef"
            :schema="orderSchemas.create.omit({ items: true })" 
            :state="formState" 
            class="space-y-6" 
            @submit="handleCreateOrder"
          >
            <!-- Personal Info Section -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormField label="Ім'я та прізвище" name="customerName" required>
                <UInput 
                  v-model="formState.customerName" 
                  placeholder="Введіть ваше ім'я"
                  size="lg"
                />
              </UFormField>

              <UFormField label="Номер телефону" name="customerPhone" required>
                <UInput 
                  v-model="formState.customerPhone" 
                  placeholder="(67) 000-00-00"
                  size="lg"
                  maxlength="9"
                  
                  :ui="{
                    base: 'pl-[3.5rem]',
                  }"
                >
                  <template #leading>
                    <span class="text-sm text-gray-500 dark:text-gray-400 w-12 text-center">+380</span>
                  </template>
                </UInput>
              </UFormField>
            </div>

            <UFormField label="Email" name="customerEmail" required>
              <UInput 
                v-model="formState.customerEmail" 
                placeholder="your@email.com"
                type="email"
                size="lg"
              />
            </UFormField>

            <UFormField label="Адреса доставки" name="deliveryAddress" required>
              <UTextarea 
                v-model="formState.deliveryAddress" 
                placeholder="Введіть повну адресу доставки"
                :rows="3"
                size="lg"
              />
            </UFormField>

            <!-- Payment Method Section -->
            <div class="pt-6 border-t border-gray-200">
              <UFormField label="Спосіб оплати" name="paymentMethod" required>
                <div class="mt-3 space-y-3">
                  <label 
                    v-for="option in paymentOptions" 
                    :key="option.value" 
                    class="flex items-center p-4 border rounded-lg cursor-pointer hover:border-primary-400 transition-colors"
                    :class="[formState.paymentMethod === option.value ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200']"
                  >
                    <input 
                      v-model="formState.paymentMethod" 
                      :value="option.value" 
                      type="radio" 
                      name="paymentMethod"
                      class="sr-only"
                    />
                    <div class="flex-1">
                      <div class="font-medium text-gray-900">{{ option.label }}</div>
                      <div class="text-sm text-gray-500">{{ option.description }}</div>
                    </div>
                  </label>
                </div>
              </UFormField>
            </div>

            <!-- Order Summary -->
            <div class="pt-6 border-t border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-3">Підсумок замовлення</h3>
              <div class="bg-gray-50 rounded-lg p-4 space-y-2">
                <div v-for="item in cart.items" :key="item.id" class="flex justify-between">
                  <span class="text-gray-600">{{ item.name }} × {{ item.quantity }}</span>
                  <span class="font-medium">{{ item.price * item.quantity }} ₴</span>
                </div>
                <div class="pt-2 border-t border-gray-200 flex justify-between font-bold text-lg">
                  <span>Всього до сплати:</span>
                  <span class="text-primary-600">{{ cart.totalPrice }} ₴</span>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <UFormField class="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200">
              <UButton 
                variant="outline" 
                size="lg" 
                @click="goBack"
                class="order-2 sm:order-1 mr-2"
              >
                <UIcon name="i-heroicons-arrow-left" class="mr-2" />
                Назад до кошика
              </UButton>
              
              <UButton 
                type="submit" 
                color="primary" 
                size="lg"
                :loading="isLoading" 
                :disabled="cart.isEmpty"
                class="order-1 sm:order-2 px-8"
              >
                <UIcon name="i-heroicons-check" class="mr-2" />
                Створити замовлення
              </UButton>
            </UFormField>
          </UForm>
        </div>

        <!-- Шаг 3: Успешное создание заказа -->
        <div v-else-if="step === 2 && createdOrder" class="p-8 text-center">
          <div class="max-w-md mx-auto">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <UIcon name="i-heroicons-check" class="w-10 h-10 text-green-600" />
            </div>
            
            <h2 class="text-3xl font-bold text-gray-900 mb-4">Дякуємо за замовлення!</h2>
            
            <div class="bg-gray-50 rounded-lg p-6 mb-6">
              <p class="text-lg mb-2">Номер вашого замовлення:</p>
              <p class="text-3xl font-bold text-primary-600">#{{ createdOrder.id }}</p>
            </div>
            
            <p class="text-gray-600 mb-8 leading-relaxed">
              Ваше замовлення успішно оформлено та передано в обробку. 
              Ми зв'яжемося з вами найближчим часом для підтвердження деталей доставки.
            </p>
            
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <UButton to="/users/orders" variant="outline" size="lg">
                <UIcon name="i-heroicons-clipboard-document-list" class="mr-2" />
                Мої замовлення
              </UButton>
              <UButton to="/" color="primary" size="lg">
                <UIcon name="i-heroicons-home" class="mr-2" />
                На головну
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Дополнительные стили для лучшей анимации */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>