/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void
        LatLng: new (lat: number, lng: number) => KakaoLatLng
        LatLngBounds: new (sw?: KakaoLatLng, ne?: KakaoLatLng) => KakaoLatLngBounds
        Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMapInstance
        Marker: new (options: KakaoMarkerOptions) => KakaoMarker
        InfoWindow: new (options?: KakaoInfoWindowOptions) => KakaoInfoWindow
        CustomOverlay: new (options: KakaoCustomOverlayOptions) => KakaoCustomOverlay
        Size: new (width: number, height: number) => KakaoSize
        Point: new (x: number, y: number) => KakaoPoint
        MarkerImage: new (src: string, size: KakaoSize, options?: KakaoMarkerImageOptions) => KakaoMarkerImage
        event: {
          addListener: (target: any, type: string, handler: (...args: any[]) => void) => void
          removeListener: (target: any, type: string, handler: (...args: any[]) => void) => void
        }
        services: {
          Places: new () => KakaoPlaces
          Geocoder: new () => KakaoGeocoder
          Status: {
            OK: string
            ZERO_RESULT: string
            ERROR: string
          }
        }
      }
    }
  }

  interface KakaoLatLng {
    getLat: () => number
    getLng: () => number
  }

  interface KakaoLatLngBounds {
    extend: (latlng: KakaoLatLng) => void
    getSouthWest: () => KakaoLatLng
    getNorthEast: () => KakaoLatLng
  }

  interface KakaoMapOptions {
    center: KakaoLatLng
    level?: number
    mapTypeId?: any
    draggable?: boolean
    scrollwheel?: boolean
    disableDoubleClick?: boolean
    disableDoubleClickZoom?: boolean
  }

  interface KakaoMapInstance {
    setCenter: (latlng: KakaoLatLng) => void
    getCenter: () => KakaoLatLng
    setLevel: (level: number, options?: { animate?: boolean | { duration: number } }) => void
    getLevel: () => number
    setBounds: (bounds: KakaoLatLngBounds, paddingTop?: number, paddingRight?: number, paddingBottom?: number, paddingLeft?: number) => void
    getBounds: () => KakaoLatLngBounds
    panTo: (latlng: KakaoLatLng) => void
    relayout: () => void
    setMapTypeId: (mapTypeId: any) => void
  }

  interface KakaoMarkerOptions {
    map?: KakaoMapInstance
    position: KakaoLatLng
    image?: KakaoMarkerImage
    title?: string
    draggable?: boolean
    clickable?: boolean
    zIndex?: number
    opacity?: number
    altitude?: number
    range?: number
  }

  interface KakaoMarker {
    setMap: (map: KakaoMapInstance | null) => void
    getMap: () => KakaoMapInstance | null
    setPosition: (position: KakaoLatLng) => void
    getPosition: () => KakaoLatLng
    setImage: (image: KakaoMarkerImage) => void
    setTitle: (title: string) => void
    setDraggable: (draggable: boolean) => void
    setClickable: (clickable: boolean) => void
    setZIndex: (zIndex: number) => void
    setOpacity: (opacity: number) => void
    setAltitude: (altitude: number) => void
    setRange: (range: number) => void
  }

  interface KakaoInfoWindowOptions {
    content?: string | HTMLElement
    position?: KakaoLatLng
    removable?: boolean
    zIndex?: number
  }

  interface KakaoInfoWindow {
    open: (map: KakaoMapInstance, marker?: KakaoMarker) => void
    close: () => void
    setContent: (content: string | HTMLElement) => void
    setPosition: (position: KakaoLatLng) => void
    getContent: () => string | HTMLElement
    getPosition: () => KakaoLatLng
  }

  interface KakaoCustomOverlayOptions {
    map?: KakaoMapInstance
    position: KakaoLatLng
    content: string | HTMLElement
    xAnchor?: number
    yAnchor?: number
    zIndex?: number
    clickable?: boolean
  }

  interface KakaoCustomOverlay {
    setMap: (map: KakaoMapInstance | null) => void
    getMap: () => KakaoMapInstance | null
    setPosition: (position: KakaoLatLng) => void
    getPosition: () => KakaoLatLng
    setContent: (content: string | HTMLElement) => void
    setZIndex: (zIndex: number) => void
  }

  interface KakaoSize {
    width: number
    height: number
  }

  interface KakaoPoint {
    x: number
    y: number
  }

  interface KakaoMarkerImageOptions {
    alt?: string
    coords?: string
    offset?: KakaoPoint
    shape?: string
    spriteOrigin?: KakaoPoint
    spriteSize?: KakaoSize
  }

  interface KakaoMarkerImage {
    _brand: 'KakaoMarkerImage'
  }

  interface KakaoPlaces {
    keywordSearch: (
      keyword: string,
      callback: (result: KakaoPlaceResult[], status: string, pagination: KakaoPagination) => void,
      options?: KakaoPlacesSearchOptions
    ) => void
    categorySearch: (
      code: string,
      callback: (result: KakaoPlaceResult[], status: string, pagination: KakaoPagination) => void,
      options?: KakaoPlacesSearchOptions
    ) => void
  }

  interface KakaoPlacesSearchOptions {
    location?: KakaoLatLng
    radius?: number
    bounds?: KakaoLatLngBounds
    size?: number
    page?: number
    sort?: string
    category_group_code?: string
  }

  interface KakaoPlaceResult {
    id: string
    place_name: string
    category_name: string
    category_group_code: string
    category_group_name: string
    phone: string
    address_name: string
    road_address_name: string
    x: string
    y: string
    place_url: string
    distance: string
  }

  interface KakaoPagination {
    totalCount: number
    hasNextPage: boolean
    hasPrevPage: boolean
    current: number
    gotoPage: (page: number) => void
    nextPage: () => void
    prevPage: () => void
  }

  interface KakaoGeocoder {
    addressSearch: (
      addr: string,
      callback: (result: KakaoAddressResult[], status: string) => void
    ) => void
    coord2Address: (
      lng: number,
      lat: number,
      callback: (result: KakaoCoord2AddressResult[], status: string) => void
    ) => void
    coord2RegionCode: (
      lng: number,
      lat: number,
      callback: (result: KakaoRegionCodeResult[], status: string) => void
    ) => void
  }

  interface KakaoAddressResult {
    address_name: string
    address_type: string
    x: string
    y: string
    address?: {
      address_name: string
      region_1depth_name: string
      region_2depth_name: string
      region_3depth_name: string
      mountain_yn: string
      main_address_no: string
      sub_address_no: string
    }
    road_address?: {
      address_name: string
      region_1depth_name: string
      region_2depth_name: string
      region_3depth_name: string
      road_name: string
      underground_yn: string
      main_building_no: string
      sub_building_no: string
      building_name: string
      zone_no: string
    }
  }

  interface KakaoCoord2AddressResult {
    address: {
      address_name: string
      region_1depth_name: string
      region_2depth_name: string
      region_3depth_name: string
      mountain_yn: string
      main_address_no: string
      sub_address_no: string
    }
    road_address: {
      address_name: string
      region_1depth_name: string
      region_2depth_name: string
      region_3depth_name: string
      road_name: string
      underground_yn: string
      main_building_no: string
      sub_building_no: string
      building_name: string
      zone_no: string
    } | null
  }

  interface KakaoRegionCodeResult {
    region_type: string
    code: string
    address_name: string
    region_1depth_name: string
    region_2depth_name: string
    region_3depth_name: string
    region_4depth_name: string
    x: number
    y: number
  }
}

export {}
