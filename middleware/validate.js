const yup = require('yup')

const DINER_IDS_REGEX = /^[0-9]+(,[0-9]+)*$/ // example: "1,2,3"

const restaurantsSchema = yup.object({
    query: yup.object({
        dinerIds: yup.string().required().matches(DINER_IDS_REGEX),
        reservationTime: yup.date().required()
    })
})

const reservationCreateSchema = yup.object({
    body: yup.object({
        tableId: yup.number().required(),
        restaurantId: yup.number().required(),
        dinerIds: yup.string().required().matches(DINER_IDS_REGEX),
        reservationTime: yup.date().required()
    })
})

const reservationDeleteSchema = yup.object({
    body: yup.object({
        reservationId: yup.number().required(),
    })
})
  
const validate = (schema) => async (req, res, next) => {
    try {
        await schema.validate({
            body: req.body,
            query: req.query,
            params: req.params,
        })
        return next()
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}

module.exports = { validate, restaurantsSchema, reservationCreateSchema, reservationDeleteSchema }
