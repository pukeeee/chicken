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

const toast = useToast()

// Управление состоянием модального окна
const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// Валидация номера телефона (украинский формат)
const isPhoneValid = computed(() => {
  const phoneRegex = /^\+380\d{9}$/
  return phoneRegex.test(formData.value.phone)
})

// Валидация кода
const isCodeValid = computed(() => {
  return formData.value.code.length === 4 && /^\d{4}$/.test(formData.value.code)
})

// Форматирование номера телефона
const formatPhone = (value: string) => {
  // Удаляем все нецифровые символы
  let digits = value.replace(/\D/g, '')
  
  // Если начинается с 380, добавляем +
  if (digits.startsWith('380')) {
    digits = '+' + digits
  }
  // Если начинается с 80, заменяем на +380
  else if (digits.startsWith('80')) {
    digits = '+3' + digits
  }
  // Если начинается с 0, заменяем на +380
  else if (digits.startsWith('0')) {
    digits = '+38' + digits
  }
  // Если только цифры без кода страны
  else if (digits.length <= 9 && !digits.startsWith('380')) {
    digits = '+380' + digits
  }
  
  return digits.slice(0, 13) // Максимум +380XXXXXXXXX
}

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

// Отправка кода на телефон
const sendCode = async () => {
  if (!isPhoneValid.value) return

  try {
    loading.value = true
    
    // Здесь будет вызов API для отправки кода
    const { sendVerificationCode } = useAuth()
    await sendVerificationCode(formData.value.phone)
    
    // Переходим на следующий шаг
    step.value = 'code'
    formData.value.code = ''
    startCountdown()
    
    toast.add({
      title: 'Код відправлено',
      description: `Код підтвердження надіслано на номер ${formData.value.phone}`,
      color: 'success'
    })
    
  } catch (error) {
    console.error('Ошибка при отправке кода:', error)
    toast.add({
      title: 'Помилка',
      description: 'Не вдалося надіслати код підтвердження',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Повторная отправка кода
const resendCode = async () => {
  if (countdown.value > 0) return
  await sendCode()
}

// Вход в систему
const login = async () => {
  if (!isCodeValid.value) return

  try {
    loading.value = true
    
    // Здесь будет вызов API для проверки кода и входа/регистрации
    const { verifyCodeAndLogin } = useAuth()
    const user = await verifyCodeAndLogin(formData.value.phone, formData.value.code)
    
    toast.add({
      title: 'Успішно',
      description: 'Ви успішно увійшли в систему',
      color: 'success'
    })
    
    emit('success', user)
    handleClose()
    
  } catch (error) {
    console.error('Ошибка при входе:', error)
    toast.add({
      title: 'Помилка',
      description: 'Невірний код підтвердження',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Обработка основного действия
const handleSubmit = async () => {
  if (step.value === 'phone') {
    await sendCode()
  } else {
    await login()
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
  if (!loading.value) {
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
  if (event.key === 'Enter' && !loading.value) {
    if (step.value === 'phone' && isPhoneValid.value) {
      handleSubmit()
    } else if (step.value === 'code' && isCodeValid.value) {
      handleSubmit()
    }
  }
}
</script>

<template>
  <UModal 
    v-model:open="isOpen"
    :dismissible="!loading"
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
          :error="formData.phone && !isPhoneValid ? 'Невірний формат номера телефону' : undefined"
        >
          <UInput
            v-model="formData.phone"
            type="tel"
            placeholder="+380XXXXXXXXX"
            autocomplete="tel"
            :disabled="loading || step === 'code'"
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
            :error="formData.code && !isCodeValid ? 'Код має містити 4 цифри' : undefined"
          >
            <UInput
              v-model="formData.code"
              type="text"
              placeholder="0000"
              maxlength="4"
              autocomplete="one-time-code"
              :disabled="loading"
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
                :disabled="countdown > 0 || loading"
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
              :disabled="loading"
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
          :disabled="loading"
        >
          Скасувати
        </UButton>
        <UButton 
          @click="handleSubmit"
          :loading="loading"
          :disabled="step === 'phone' ? !isPhoneValid : !isCodeValid"
          class="min-w-24"
        >
          {{ step === 'phone' ? 'Далі' : 'Увійти' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>