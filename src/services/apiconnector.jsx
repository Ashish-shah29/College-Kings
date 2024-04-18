import axios from 'axios'

export const axiosInstance = axios.create({})

export const apiConnector =async (method,url,bodyData,headers,params)=>{
  console.log("AXios call jaa rhi h FD TO BD")
  return axiosInstance({
    method:`${method}`,
    url:`${url}`,
    data:bodyData? bodyData:null,
    headers: headers ? headers:null,
    params: params? params:null
  })
}
