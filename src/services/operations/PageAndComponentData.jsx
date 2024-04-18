import React from 'react'
import toast from 'react-hot-toast'
import { apiConnector } from '../apiconnector'
import { catalogData } from '../apis'

export const getCatalogPageData = async(categoryId) => {
  let toastId = toast.loading("loading")
  let result= []
  console.log("CATAGORY ID in front : ",categoryId)
   try{
  const response = await apiConnector("POST",catalogData.CATALOGPAGEDATA_API,{categoryId:categoryId});
  if(!response?.data?.success){
    throw new Error("Could not fetch catalog page details ! ")
  }
  result = response?.data;
  console.log("API RESULT : ",result)
}
  catch(err){
    console.log("CATALOG PAGE DATA API ERROR...",err)
    toast.error(err.message)
    result = err.response.data
  }
  toast.dismiss(toastId)
  return result;                                          
}
