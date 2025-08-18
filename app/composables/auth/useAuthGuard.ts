import { until } from "@vueuse/core"
import { useAuth } from "./useAuth"

/**
 * Композабл для защиты роутов от неавторизованных пользователей
 * Используется на страницах, требующих авторизации
 */
export const useAuthGuard = () => {
  const { isAuthenticated, isInitialized } = useAuth()
  
  // Локальное состояние загрузки страницы
  const isPageLoading = ref(true)
  const shouldShowContent = ref(false)

  /**
   * Проверка доступа к текущей странице
   */
  const checkAccess = async () => {
    // Ждем инициализации авторизации
    await until(isInitialized).toMatch(v => v === true)

    
    // Если не авторизован - редиректим
    if (!isAuthenticated.value) {
      await navigateTo('/')
      return false
    }

    // Показываем контент
    isPageLoading.value = false
    shouldShowContent.value = true
    return true
  }

  // Вычисляемые свойства для удобства
  const showLoadingSpinner = computed(() => {
    return isPageLoading.value || !isInitialized.value
  })

  const showPageContent = computed(() => {
    return shouldShowContent.value && isAuthenticated.value && isInitialized.value
  })

  // Автоматическая проверка при монтировании
  onMounted(() => {
    checkAccess()
  })

  // Отслеживаем изменения авторизации
  watch([isAuthenticated, isInitialized], () => {
    if (isInitialized.value && !isAuthenticated.value) {
      navigateTo('/')
    } else if (isAuthenticated.value && isInitialized.value) {
      isPageLoading.value = false
      shouldShowContent.value = true
    }
  })

  return {
    // Состояние
    isPageLoading: readonly(isPageLoading),
    shouldShowContent: readonly(shouldShowContent),
    
    // Вычисляемые свойства
    showLoadingSpinner: readonly(showLoadingSpinner),
    showPageContent: readonly(showPageContent),
    
    // Методы
    checkAccess
  }
}

/**
 * Композабл для отображения скелетона загрузки
 */
export const useLoadingSkeleton = () => {
  const createSkeleton = (lines: number = 3) => {
    return h('div', {
      class: 'animate-pulse p-6 space-y-4'
    }, [
      h('div', { class: 'h-8 bg-gray-200 rounded w-1/3' }),
      h('div', { class: 'space-y-2' }, 
        Array.from({ length: lines }, (_, i) => 
          h('div', { 
            class: `h-4 bg-gray-200 rounded`,
            style: { width: i === lines - 1 ? '50%' : '100%' }
          })
        )
      )
    ])
  }

  return {
    createSkeleton
  }
}