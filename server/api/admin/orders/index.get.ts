import { fetchAllOrders } from "~~/server/services/admin/orderService"
import { orderSchemas } from "~~/shared/validation/schemas"

export default defineEventHandler(async (event) => {
    try {
        const query = await getValidatedQuery(event, (query) => orderSchemas.filters.safeParse(query)); 

        if(!query.success){
            throw new Error(query.error.issues.map(e => e.message).join(', ')); 
        }

        const ordersData = await fetchAllOrders(query.data);

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