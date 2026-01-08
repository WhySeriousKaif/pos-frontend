import React from 'react'
import ProductSection from './ProductSection/ProductSection'
import CardSection from './CardSection/CardSection'
import CustomerPaymentSection from './CustomerPaymentSection/CustomerPaymentSection'

const CreateOrder = () => {
  return (
    <div className='flex flex-1 overflow-hidden flex-col lg:flex-row h-full'>
            <ProductSection/>
            <CardSection/>
            <CustomerPaymentSection/>
    </div>
  )
}

export default CreateOrder
