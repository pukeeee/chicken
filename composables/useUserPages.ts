/**
 * Composable для работы с пользовательскими страницами
 * Обеспечивает защиту роутов и предотвращает флашинг контента
 */
export const useUserPages = () => {
  const { isAuthenticated, isInitialized, user } = useAuth()
  const route = useRoute()
  
  // Состояние загрузки страницы
  const isPageLoading = ref(true)
  const shouldShowContent = ref(false)

  // Проверка доступа к странице
  const checkPageAccess = async () => {
    // Если еще не инициализирован, ждем
    if (!isInitialized.value) {
      isPageLoading.value = true
      shouldShowContent.value = false
      return
    }

    // Если не авторизован, редиректим
    if (!isAuthenticated.value) {
      await navigateTo('/')
      return
    }

    // Если все ОК, показываем контент
    isPageLoading.value = false
    shouldShowContent.value = true
  }

  // Наблюдаем за изменениями состояния авторизации
  watchEffect(() => {
    checkPageAccess()
  })

  // Инициализация при монтировании
  onMounted(() => {
    checkPageAccess()
  })

  // Хелперы для отображения компонентов
  const showLoadingSpinner = computed(() => {
    return isPageLoading.value || !isInitialized.value
  })

  const showPageContent = computed(() => {
    return shouldShowContent.value && isAuthenticated.value && isInitialized.value
  })

  return {
    // Состояние
    isPageLoading: readonly(isPageLoading),
    shouldShowContent: readonly(shouldShowContent),
    
    // Computed свойства для компонентов
    showLoadingSpinner,
    showPageContent,
    
    // Данные пользователя
    user,
    
    // Методы
    checkPageAccess
  }
}

/**
 * Composable для отображения скелетона загрузки
 */
export const useUserPageSkeleton = () => {
  return {
    render: () => h('div', {
      class: 'animate-pulse p-6 space-y-4'
    }, [
      h('div', { class: 'h-8 bg-gray-200 rounded w-1/3' }),
      h('div', { class: 'space-y-2' }, [
        h('div', { class: 'h-4 bg-gray-200 rounded w-full' }),
        h('div', { class: 'h-4 bg-gray-200 rounded w-3/4' }),
        h('div', { class: 'h-4 bg-gray-200 rounded w-1/2' })
      ])
    ])
  }
}