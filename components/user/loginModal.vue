<script setup lang="ts">

interface LoginFormData {
  phone: string
  code: string
}

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success', user: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const step = ref<'phone' | 'code'>('phone')
const countdown = ref(0)
const countdownInterval = ref<NodeJS.Timeout | null>(null)

const formData = ref<LoginFormData>({
  phone: '',
  code: ''
})

const {
  formatPhone,
  isCodeValid,
  isPhoneValid,
  sendVerificationCode,
  verifyCodeAndLogin,
  isLoading
} = useAuth()

const toast = useToast()

// Управление состоянием модального окна
const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// Обработка ввода номера телефона
const handlePhoneInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const formatted = formatPhone(target.value)
  formData.value.phone = formatted
  target.value = formatted
}

// Запуск таймера обратного отсчета
const startCountdown = () => {
  countdown.value = 60
  countdownInterval.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownInterval.value!)
      countdownInterval.value = null
    }
  }, 1000)
}

// Остановка таймера
const stopCountdown = () => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
    countdownInterval.value = null
  }
  countdown.value = 0
}

// Повторная отправка кода
const resendCode = async () => {
  if (countdown.value > 0) return
  
  const result = await sendVerificationCode(formData.value.phone)
  if (result.success) {
    startCountdown()
  }
}

// Обработка основного действия
const handleSubmit = async () => {
  if (step.value === 'phone') {
    const result = await sendVerificationCode(formData.value.phone)
    if (result.success) {
      step.value = 'code'
      formData.value.code = ''
      startCountdown()
    }
  } else {
    const result = await verifyCodeAndLogin(formData.value.phone, formData.value.code)
    if (result.success) {
      emit('success', result.user)
      handleClose()
    }
  }
}

// Возврат к вводу номера
const goBackToPhone = () => {
  step.value = 'phone'
  formData.value.code = ''
  stopCountdown()
}

// Закрытие модального окна
const handleClose = () => {
  if (!isLoading) {
    isOpen.value = false
  }
}

// Сброс формы при закрытии
watch(isOpen, (newValue) => {
  if (!newValue) {
    setTimeout(() => {
      step.value = 'phone'
      formData.value = {
        phone: '',
        code: ''
      }
      stopCountdown()
    }, 200)
  }
})

// Очистка таймера при размонтировании
onUnmounted(() => {
  stopCountdown()
})

// Горячие клавиши
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !isLoading) {
    if (step.value === 'phone' && isPhoneValid(formData.value.phone)) {
      handleSubmit()
    } else if (step.value === 'code' && isCodeValid(formData.value.code)) {
      handleSubmit()
    }
  }
}
</script>

<template>
  <UModal 
    v-model:open="isOpen"
    :dismissible="!isLoading"
    title="Вхід в систему"
    description="Увійдіть за допомогою номера телефону"
    :ui="{ content: 'sm:max-w-md' }"
  >
    <template #body>
      <form @submit.prevent="handleSubmit" @keypress="handleKeyPress" class="space-y-6">
        <!-- Поле ввода номера телефона -->
        <UFormField
          label="Номер телефону" 
          name="phone"
          required
          :error="formData.phone && !isPhoneValid(formData.phone) ? 'Невірний формат номера телефону' : undefined"
        >
          <UInput
            v-model="formData.phone"
            type="tel"
            placeholder="+380XXXXXXXXX"
            autocomplete="tel"
            :disabled="isLoading || step === 'code'"
            @input="handlePhoneInput"
            :ui="{
              base: 'transition-all duration-200'
            }"
          >
            <template #leading>
              <UIcon name="i-lucide-phone" class="w-4 h-4" />
            </template>
          </UInput>
        </UFormField>

        <!-- Поле ввода кода (показывается после отправки) -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 transform -translate-y-2"
          enter-to-class="opacity-100 transform translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 transform translate-y-0"
          leave-to-class="opacity-0 transform -translate-y-2"
        >
          <UFormField 
            v-if="step === 'code'"
            label="Код підтвердження" 
            name="code"
            required
            :error="formData.code && !isCodeValid(formData.code) ? 'Код має містити 6 цифри' : undefined"
          >
            <UInput
              v-model="formData.code"
              type="text"
              placeholder="CH1K3N"
              maxlength="6"
              autocomplete="one-time-code"
              :disabled="isLoading"
              class="text-center tracking-widest text-lg"
            >
              <template #leading>
                <UIcon name="i-lucide-shield-check" class="w-4 h-4" />
              </template>
            </UInput>
            
            <!-- Информация о коде и повторная отправка -->
            <div class="mt-2 flex items-center justify-between text-sm">
              <p class="text-gray-600 dark:text-gray-400">
                Код надіслано на {{ formData.phone }}
              </p>
              <button
                type="button"
                :disabled="countdown > 0 || isLoading"
                @click="resendCode"
                class="text-primary-600 hover:text-primary-500 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {{ countdown > 0 ? `Повторити через ${countdown}с` : 'Надіслати знову' }}
              </button>
            </div>
          </UFormField>
        </Transition>

        <!-- Кнопка возврата к номеру телефона -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div v-if="step === 'code'" class="flex justify-center">
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              @click="goBackToPhone"
              :disabled="isLoading"
            >
              <template #leading>
                <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
              </template>
              Змінити номер
            </UButton>
          </div>
        </Transition>
      </form>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton 
          color="neutral" 
          variant="outline" 
          @click="handleClose"
          :disabled="isLoading"
        >
          Скасувати
        </UButton>
        <UButton 
          @click="handleSubmit"
          :loading="isLoading"
          :disabled="step === 'phone' ? !isPhoneValid(formData.phone) : !isCodeValid(formData.code)"
          class="min-w-24"
        >
          {{ step === 'phone' ? 'Далі' : 'Увійти' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>