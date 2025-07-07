// RajaOngkir API Service
// Based on https://komerceapi.readme.io/reference/rajaongkir-api

const RAJAONGKIR_BASE_URL = 'https://api.rajaongkir.com/starter'

export interface Province {
  province_id: string
  province: string
}

export interface City {
  city_id: string
  province_id: string
  province: string
  type: string
  city_name: string
  postal_code: string
}

export interface ShippingCost {
  code: string
  name: string
  costs: {
    service: string
    description: string
    cost: {
      value: number
      etd: string
      note: string
    }[]
  }[]
}

export interface ShippingCostResponse {
  rajaongkir: {
    query: {
      origin: string
      destination: string
      weight: number
      courier: string
    }
    status: {
      code: number
      description: string
    }
    origin_details: {
      city_id: string
      province_id: string
      province: string
      type: string
      city_name: string
      postal_code: string
    }
    destination_details: {
      city_id: string
      province_id: string
      province: string
      type: string
      city_name: string
      postal_code: string
    }
    results: ShippingCost[]
  }
}

class RajaOngkirService {
  private async makeRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) {
    const url = `${RAJAONGKIR_BASE_URL}/${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/x-www-form-urlencoded'
    }

    const config: RequestInit = {
      method,
      headers
    }

    if (data && method === 'POST') {
      const formData = new URLSearchParams()
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value.toString())
      })
      config.body = formData
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.rajaongkir?.status?.code !== 200) {
        throw new Error(result.rajaongkir?.status?.description || 'API Error')
      }
      
      return result
    } catch (error) {
      console.error('RajaOngkir API Error:', error)
      throw error
    }
  }

  // Get all provinces
  async getProvinces(): Promise<Province[]> {
    const response = await this.makeRequest('province')
    return response.rajaongkir.results
  }

  // Get cities by province
  async getCities(provinceId?: string): Promise<City[]> {
    const endpoint = provinceId ? `city?province=${provinceId}` : 'city'
    const response = await this.makeRequest(endpoint)
    return response.rajaongkir.results
  }

  // Calculate shipping cost
  async getShippingCost(
    origin: string,
    destination: string,
    weight: number,
    courier: string = 'jne'
  ): Promise<ShippingCostResponse> {
    const data = {
      origin,
      destination,
      weight,
      courier
    }
    
    return await this.makeRequest('cost', 'POST', data)
  }

  // Get available couriers
  getAvailableCouriers() {
    return [
      { code: 'jne', name: 'JNE' },
      { code: 'pos', name: 'POS Indonesia' },
      { code: 'tiki', name: 'TIKI' }
    ]
  }
}

export const rajaOngkirService = new RajaOngkirService()

// Mock data for development (when API is not available)
export const mockProvinces: Province[] = [
  { province_id: '1', province: 'DKI Jakarta' },
  { province_id: '2', province: 'Jawa Barat' },
  { province_id: '3', province: 'Jawa Tengah' },
  { province_id: '4', province: 'DI Yogyakarta' },
  { province_id: '5', province: 'Jawa Timur' },
  { province_id: '6', province: 'Banten' },
  { province_id: '7', province: 'Sumatera Utara' },
  { province_id: '8', province: 'Sumatera Barat' },
  { province_id: '9', province: 'Riau' },
  { province_id: '10', province: 'Kepulauan Riau' }
]

export const mockCities: City[] = [
  { city_id: '1', province_id: '1', province: 'DKI Jakarta', type: 'Kota', city_name: 'Jakarta Pusat', postal_code: '10110' },
  { city_id: '2', province_id: '1', province: 'DKI Jakarta', type: 'Kota', city_name: 'Jakarta Utara', postal_code: '14110' },
  { city_id: '3', province_id: '1', province: 'DKI Jakarta', type: 'Kota', city_name: 'Jakarta Barat', postal_code: '11110' },
  { city_id: '4', province_id: '1', province: 'DKI Jakarta', type: 'Kota', city_name: 'Jakarta Selatan', postal_code: '12110' },
  { city_id: '5', province_id: '1', province: 'DKI Jakarta', type: 'Kota', city_name: 'Jakarta Timur', postal_code: '13110' },
  { city_id: '6', province_id: '2', province: 'Jawa Barat', type: 'Kota', city_name: 'Bandung', postal_code: '40111' },
  { city_id: '7', province_id: '2', province: 'Jawa Barat', type: 'Kota', city_name: 'Bekasi', postal_code: '17111' },
  { city_id: '8', province_id: '3', province: 'Jawa Tengah', type: 'Kota', city_name: 'Semarang', postal_code: '50111' },
  { city_id: '9', province_id: '4', province: 'DI Yogyakarta', type: 'Kota', city_name: 'Yogyakarta', postal_code: '55111' },
  { city_id: '10', province_id: '5', province: 'Jawa Timur', type: 'Kota', city_name: 'Surabaya', postal_code: '60111' }
]

export const mockShippingCosts: ShippingCost[] = [
  {
    code: 'jne',
    name: 'Jalur Nugraha Ekakurir (JNE)',
    costs: [
      {
        service: 'OKE',
        description: 'Ongkos Kirim Ekonomis',
        cost: [
          { value: 15000, etd: '2-3', note: '' }
        ]
      },
      {
        service: 'REG',
        description: 'Layanan Regular',
        cost: [
          { value: 25000, etd: '1-2', note: '' }
        ]
      },
      {
        service: 'YES',
        description: 'Yakin Esok Sampai',
        cost: [
          { value: 45000, etd: '1', note: '' }
        ]
      }
    ]
  },
  {
    code: 'pos',
    name: 'POS Indonesia (POS)',
    costs: [
      {
        service: 'Paket Kilat Khusus',
        description: 'Paket Kilat Khusus',
        cost: [
          { value: 20000, etd: '1-2', note: '' }
        ]
      },
      {
        service: 'Express Next Day Barang',
        description: 'Express Next Day Barang',
        cost: [
          { value: 35000, etd: '1', note: '' }
        ]
      }
    ]
  },
  {
    code: 'tiki',
    name: 'Citra Van Titipan Kilat (TIKI)',
    costs: [
      {
        service: 'REG',
        description: 'Layanan Regular',
        cost: [
          { value: 22000, etd: '2-3', note: '' }
        ]
      },
      {
        service: 'ECO',
        description: 'Layanan Ekonomis',
        cost: [
          { value: 18000, etd: '3-4', note: '' }
        ]
      }
    ]
  }
]