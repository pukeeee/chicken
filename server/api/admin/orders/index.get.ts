import { fetchAllOrders } from "~/server/services/admin/orderService"

export default defineEventHandler(async (event) => {
    try {
        // Получаем query параметры
        const query = getQuery(event)
        const filters = {
            status: query.status as string,
            search: query.search as string,
            page: parseInt(query.page as string) || 1,
            limit: parseInt(query.limit as string) || 5
        }
        
        const ordersData = await fetchAllOrders(filters)

        return {
            success: true,
            ...ordersData
        }
    }
    catch (err) {
        console.log('Error in order API', err)

        if (err instanceof Error) {
            throw createError({ 
                statusCode: 400, 
                message: err.message 
            })
        }
          
        throw createError({ 
            statusCode: 500
        })
    }
})