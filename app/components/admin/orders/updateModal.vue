<script setup lang="ts">
import type { Order, OrderUpdateData } from '~/app/types/order'
import { formatDate } from '~/app/utils/formatters'
import { getStatusIcon, getStatusColor, getStatusLabel, getPaymentIcon } from '~/app/utils/orderHelper'
import { useOrderForm } from '~/app/composables/useOrderForm'

interface Props {
    order: Order
    modelValue: boolean
}

interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'save', orderId: number, updateData: OrderUpdateData): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const toast = useToast()

// Используем композабл для работы с формой
const {
    formData,
    statusOptions,
    paymentOptions,
    isFormValid,
    errors,
    initializeForm,
    resetForm,
    getChangedData,
    normalizeFormData
} = useOrderForm()

// Вычисляемое свойство для управления состоянием модального окна
const isOpen = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
})

// Инициализация формы при изменении заказа
watch(() => props.order, (newOrder) => {
    if (newOrder) {
        initializeForm(newOrder)
    }
}, { immediate: true })

// Сброс формы при закрытии модального окна
watch(isOpen, (newValue) => {
    if (!newValue) {
        // Небольшая задержка для плавного закрытия модального окна
        setTimeout(() => {
            resetForm()
        }, 200)
    }
})

// Обработка сохранения
const handleSave = async () => {
    if (!props.order || !isFormValid.value) return

    try {
        loading.value = true
        
        // Нормализуем данные перед сохранением
        normalizeFormData()
        
        // Получаем только измененные данные
        const updateData = getChangedData(props.order)

        // Если нет изменений
        if (Object.keys(updateData).length === 0) {
            toast.add({
                title: 'Інформація',
                description: 'Зміни не виявлені',
                color: 'info'
            })
            handleClose()
            return
        }

        // Отправляем изменения
        emit('save', props.order.id, updateData)
        
        toast.add({
            title: 'Успіх',
            description: 'Замовлення успішно оновлено',
            color: 'success'
        })
        
        handleClose()
    } catch (error) {
        console.error('Помилка при оновленні замовлення:', error)
        toast.add({
            title: 'Помилка',
            description: 'Не вдалося оновити замовлення',
            color: 'error'
        })
    } finally {
        loading.value = false
    }
}

// Обработка закрытия модального окна
const handleClose = () => {
    if (!loading.value) {
        isOpen.value = false
    }
}
</script>

<template>
  <UModal 
    v-model:open="isOpen"
    :dismissible="false"
    title="Редагування замовлення"
    :description="`Замовлення #${order?.id}`"
    :close="{ 
      onClick: handleClose, 
      disabled: loading 
    }"
    :ui="{ 
      content: 'sm:max-w-2xl',
      footer: 'justify-end'
    }"
  >
    <template #body>
      <div class="space-y-6">
        <!-- Основная информация о заказе -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Статус заказа -->
          <UFormField label="Статус замовлення" name="status" required>
            <USelectMenu
              v-model="formData.status"
              :options="statusOptions"
              value-attribute="value"
            >
              <template #leading>
                <UIcon 
                  :name="getStatusIcon(formData.status)" 
                  :class="getStatusColor(formData.status)"
                />
              </template>
              <span :class="getStatusColor(formData.status)">
                {{ getStatusLabel(formData.status) }}
              </span>
            </USelectMenu>
          </UFormField>

          <!-- Способ оплаты -->
          <UFormField label="Спосіб оплати" name="paymentMethod" required>
            <USelectMenu
              v-model="formData.paymentMethod"
              :options="paymentOptions"
              value-attribute="value"
            >
              <template #leading>
                <UIcon :name="getPaymentIcon(formData.paymentMethod)" />
              </template>
              {{ paymentOptions.find(p => p.value === formData.paymentMethod)?.label || 'Невідомо' }}
            </USelectMenu>
          </UFormField>
        </div>

        <!-- Информация о клиенте -->
        <div class="space-y-4">
          <h4 class="text-sm font-medium text-gray-900 dark:text-white">
            Інформація про клієнта
          </h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Ім'я клієнта" name="customerName">
              <UInput
                v-model="formData.customerName"
                placeholder="Введіть ім'я клієнта"
              />
            </UFormField>

            <UFormField label="Телефон клієнта" name="customerPhone" required :error="errors.customerPhone">
              <UInput
                v-model="formData.customerPhone"
                placeholder="+380XXXXXXXXX"
                type="tel"
                :error="!!errors.customerPhone"
              />
            </UFormField>
          </div>

          <UFormField label="Адреса доставки" name="deliveryAddress">
            <UTextarea
              v-model="formData.deliveryAddress"
              placeholder="Введіть адресу доставки"
              :rows="2"
            />
          </UFormField>
        </div>

        <!-- Сумма заказа -->
        <div class="space-y-4">
          <h4 class="text-sm font-medium text-gray-900 dark:text-white">
            Фінансова інформація
          </h4>
          
          <UFormField label="Загальна сума" name="total" required :error="errors.total">
            <UInput
              v-model.number="formData.total"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              :error="!!errors.total"
            >
              <template #trailing>
                <span class="text-gray-500 text-sm">₴</span>
              </template>
            </UInput>
          </UFormField>
        </div>

        <!-- Товары в заказе (только просмотр) -->
        <div class="space-y-4">
          <h4 class="text-sm font-medium text-gray-900 dark:text-white">
            Товари в замовленні
          </h4>
          
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div 
              v-if="order?.items && order.items.length > 0"
              class="space-y-3"
            >
              <div 
                v-for="item in order.items" 
                :key="item.id"
                class="flex justify-between items-center"
              >
                <div class="flex items-center space-x-3">
                  <img 
                    v-if="item.image"
                    :src="item.image" 
                    :alt="item.product.name"
                    class="w-10 h-10 rounded-lg object-cover"
                  >
                  <div 
                    v-else
                    class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center"
                  >
                    <UIcon name="i-lucide-package" class="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ item.product.name }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ item.price }}₴ × {{ item.quantity }}
                    </p>
                  </div>
                </div>
                <div class="text-sm font-semibold text-gray-900 dark:text-white">
                  {{ (item.price * item.quantity).toFixed(2) }}₴
                </div>
              </div>
            </div>
            <div v-else class="text-center text-gray-500 py-4">
              <UIcon name="i-lucide-package-x" class="w-8 h-8 mx-auto mb-2" />
              <p class="text-sm">Товари не знайдені</p>
            </div>
          </div>
        </div>

        <!-- Информация о создании -->
        <div class="text-xs text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p>Створено: {{ formatDate(order.createdAt) }}</p>
          <p v-if="order?.user">
            Користувач: {{ order.user.name || order.user.email || order.user.phone }}
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex gap-3">
        <UButton 
          color="neutral" 
          variant="outline" 
          @click="handleClose"
          :disabled="loading"
        >
          Скасувати
        </UButton>
        <UButton 
          @click="handleSave"
          :loading="loading"
          :disabled="!isFormValid"
        >
          Зберегти зміни
        </UButton>
      </div>
    </template>
  </UModal>
</template>