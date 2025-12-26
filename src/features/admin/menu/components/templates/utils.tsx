import { Category, MenuItem } from '../../types'
import { pdf, Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer'

// S3 Public URL
const S3_PUBLIC_URL = process.env.NEXT_PUBLIC_S3_PUBLIC_URL || 'https://s3.ntnhan.site'

Font.register({
  family: 'Inter',
  fonts: [
    {
      src: '/fonts/Inter-Regular.ttf',
      fontWeight: 'normal',
    },
    {
      src: '/fonts/Inter-Italic.ttf',
      fontWeight: 'normal',
      fontStyle: 'italic',
    },
    {
      src: '/fonts/Inter-Bold.ttf',
      fontWeight: 'bold',
    },
    {
      src: '/fonts/Inter-BoldItalic.ttf',
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
})

Font.registerEmojiSource({
  format: 'png',
  url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/',
})

// Helper function to load image as PNG data URI
const loadImageAsDataURI = async (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img')
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      const dataURI = canvas.toDataURL('image/png')
      resolve(dataURI)
    }
    img.onerror = reject
    img.src = url
  })
}

// Helper function to generate PDF blob
export const generatePDFBlob = async (
  restaurantInfo: any,
  menuItemsByCategory: Record<string, any[]>,
  categories: Category[],
  displayOptions: any,
  theme: string,
  accentColor: string,
  templateId: string,
  fontSize: 'small' | 'medium' | 'large' = 'medium',
  chefIcon: string = '⭐',
): Promise<Blob> => {
  // Collect all unique image URLs that need conversion (unsupported formats)
  const allItems = Object.values(menuItemsByCategory).flat()
  const unsupportedUrls = new Set<string>()
  allItems.forEach((item) => {
    if (item.images && item.images.length > 0) {
      const primary = item.images.find((img: any) => img.is_primary)?.image_url
      const first = item.images[0]?.image_url
      ;[primary, first].forEach((url) => {
        if (url && url.startsWith(S3_PUBLIC_URL) && !/\.(jpg|jpeg|png)$/i.test(url)) {
          unsupportedUrls.add(url)
        }
      })
    }
  })

  // Load unsupported images as PNG data URIs
  const imageData: Record<string, string> = {}
  await Promise.all(
    Array.from(unsupportedUrls).map(async (url) => {
      try {
        const loadUrl = url.replace(`${S3_PUBLIC_URL}`, '/s3-storage')
        const dataURI = await loadImageAsDataURI(loadUrl)
        imageData[url] = dataURI
      } catch (error) {
        console.error('Failed to convert image:', url, error)
        // Will fall back to placeholder
      }
    }),
  )

  const doc = (
    <MenuPDFDocument
      restaurantInfo={restaurantInfo}
      menuItemsByCategory={menuItemsByCategory}
      categories={categories}
      displayOptions={displayOptions}
      theme={theme}
      accentColor={accentColor}
      templateId={templateId}
      fontSize={fontSize}
      chefIcon={' ' + chefIcon}
      imageData={imageData}
    />
  )

  return await pdf(doc).toBlob()
}

// PDF Document Component
const MenuPDFDocument = ({
  restaurantInfo,
  menuItemsByCategory,
  categories,
  displayOptions,
  theme,
  accentColor,
  templateId,
  fontSize = 'medium',
  chefIcon = '⭐',
  imageData = {},
}: {
  restaurantInfo: any
  menuItemsByCategory: Record<string, any[]>
  categories: Category[]
  displayOptions: any
  theme: string
  accentColor: string
  templateId: string
  fontSize?: 'small' | 'medium' | 'large'
  chefIcon?: string
  imageData?: Record<string, string>
}) => {
  const getSelectedImageUrl = (images: any[]) => {
    const primary = images.find((img: any) => img.is_primary)
    return primary?.image_url || images[0]?.image_url || '/placeholder.jpg'
  }

  const transformImageUrl = (url: string) => {
    // Unsupported format converted to data URI
    if (imageData[url]) {
      return imageData[url]
    }

    // Transform S3 URL to local rewrite path
    if (url.startsWith(S3_PUBLIC_URL)) {
      const transformed = url.replace(`${S3_PUBLIC_URL}`, '/s3-storage')
      return transformed
    }
    return url
  }

  const accentColors = {
    emerald: { light: '#059669', dark: '#34d399' },
    blue: { light: '#2563eb', dark: '#60a5fa' },
    amber: { light: '#d97706', dark: '#fbbf24' },
    rose: { light: '#e11d48', dark: '#fb7185' },
  }
  const currentAccent = accentColors[accentColor as keyof typeof accentColors]
  const categoryColor = theme === 'light' ? currentAccent.light : currentAccent.dark

  // Quality and font size-based font sizes and spacing
  const baseFontSizes = {
    small: {
      title: 15,
      subtitle: 9,
      categoryHeader: 9,
      itemName: 9,
      itemDescription: 9,
      itemPrice: 9,
      truncationText: 9,
    },
    medium: {
      title: 17,
      subtitle: 11,
      categoryHeader: 11,
      itemName: 11,
      itemDescription: 11,
      itemPrice: 11,
      truncationText: 11,
    },
    large: {
      title: 19,
      subtitle: 13,
      categoryHeader: 13,
      itemName: 13,
      itemDescription: 13,
      itemPrice: 13,
      truncationText: 13,
    },
  }

  const baseImageSizes = {
    small: 60,
    medium: 88,
    large: 108,
  }

  const imageSize = baseImageSizes[fontSize]

  const fontSizes = {
    title: baseFontSizes[fontSize].title,
    subtitle: baseFontSizes[fontSize].subtitle,
    categoryHeader: baseFontSizes[fontSize].categoryHeader,
    itemName: baseFontSizes[fontSize].itemName,
    itemDescription: baseFontSizes[fontSize].itemDescription,
    itemPrice: baseFontSizes[fontSize].itemPrice,
    truncationText: baseFontSizes[fontSize].truncationText,
  }

  const styles = StyleSheet.create({
    page: {
      padding: 20,
      backgroundColor: theme === 'light' ? '#ffffff' : '#1e293b',
      color: theme === 'light' ? '#0f172a' : '#f1f5f9',
      fontFamily: 'Inter',
    },
    header: {
      marginBottom: 24,
      textAlign: 'center',
    },
    title: {
      fontSize: fontSizes.title,
      fontWeight: 'bold',
      color: theme === 'light' ? '#0f172a' : '#ffffff',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: fontSizes.subtitle,
      color: theme === 'light' ? '#475569' : '#cbd5e1',
    },
    category: {
      marginBottom: 16,
      breakInside: 'avoid',
    },
    categoryHeader: {
      fontSize: fontSizes.categoryHeader,
      fontWeight: 'bold',
      color: categoryColor,
      marginBottom: 4,
      paddingBottom: 2,
      borderBottomWidth: 1,
      borderBottomColor: theme === 'light' ? '#e2e8f0' : '#475569',
    },
    menuItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
      breakInside: 'avoid',
    },
    itemLeft: {
      flex: 1,
    },
    itemName: {
      fontSize: fontSizes.itemName,
      fontWeight: 'normal',
      color: theme === 'light' ? '#0f172a' : '#ffffff',
    },
    itemDescription: {
      fontSize: fontSizes.itemDescription,
      color: theme === 'light' ? '#64748b' : '#94a3b8',
      marginTop: 4,
    },
    itemPrice: {
      fontSize: fontSizes.itemPrice,
      fontWeight: 'bold',
      color: theme === 'light' ? '#0f172a' : '#ffffff',
      marginLeft: 8,
    },
    truncationText: {
      fontSize: fontSizes.truncationText,
      color: theme === 'light' ? '#64748b' : '#94a3b8',
      marginTop: 8,
    },
    emptyState: {
      textAlign: 'center',
      paddingTop: 32,
      color: theme === 'light' ? '#64748b' : '#94a3b8',
    },
  })

  // Template-specific rendering
  const renderTemplateContent = () => {
    const effectiveTheme = theme
    const effectiveAccent = categoryColor

    /// Calculate approximate items per page based on template and font size
    const getMaxItemsPerPage = (templateId: string, fontSize: 'small' | 'medium' | 'large') => {
      const fontMultiplier = {
        small: 1.2, // More items fit with smaller font
        medium: 1,
        large: 0.8, // Fewer items with larger font
      }
      const baseItems = {
        '1': 20,
        '2': 5,
        '3': 13,
        '4': 15,
        default: 10,
      }
      const base = baseItems[templateId as keyof typeof baseItems] || baseItems.default
      return Math.floor(base * fontMultiplier[fontSize])
    }

    const maxItemsPerPage = getMaxItemsPerPage(templateId || '', fontSize)

    // Flatten all items for pagination
    const allItems = Object.entries(menuItemsByCategory).flatMap(([categoryId, items]) =>
      items.map((item) => ({ ...item, categoryId })),
    )

    const totalItems = allItems.length
    const itemsPerPage = maxItemsPerPage

    switch (templateId) {
      case '1': { // Minimal A4 2-Column
        // Create multiple pages
        const pages = []

        for (let pageIndex = 0; pageIndex < Math.ceil(totalItems / itemsPerPage); pageIndex++) {
          const startItem = pageIndex * itemsPerPage
          const endItem = startItem + itemsPerPage
          const pageItems = allItems.slice(startItem, endItem)

          // Group by category for this page
          const pageCategories: Record<string, MenuItem[]> = pageItems.reduce(
            (acc, item) => {
              if (!acc[item.categoryId]) acc[item.categoryId] = []
              acc[item.categoryId].push(item)
              return acc
            },
            {} as Record<string, MenuItem[]>,
          )

          // Distribute categories into 2 columns, balancing total items
          const distributeCategories2Col = (
            categories: [string, MenuItem[]][],
            numColumns: number,
          ) => {
            // Sort categories by item count descending
            const sortedCategories = categories.sort((a, b) => b[1].length - a[1].length)
            const columns: [string, MenuItem[]][][] = Array.from({ length: numColumns }, () => [])
            const columnTotals = Array(numColumns).fill(0)

            for (const category of sortedCategories) {
              // Find column with least items
              const minIndex = columnTotals.indexOf(Math.min(...columnTotals))
              columns[minIndex].push(category)
              columnTotals[minIndex] += category[1].length
            }

            return columns
          }

          const columns = distributeCategories2Col(Object.entries(pageCategories), 2)

          pages.push(
            <Page key={pageIndex} size={[595, 842]} style={styles.page}>
              {pageIndex === 0 && (
                <View style={styles.header}>
                  <Text
                    style={[
                      styles.title,
                      { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' },
                    ]}
                  >
                    {restaurantInfo.name}
                  </Text>
                  <Text
                    style={[
                      styles.subtitle,
                      { color: effectiveTheme === 'light' ? '#475569' : '#cbd5e1' },
                    ]}
                  >
                    {restaurantInfo.address} • {restaurantInfo.phone}
                  </Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', gap: 20, marginTop: pageIndex === 0 ? 0 : 40 }}>
                <View style={{ flex: 1 }}>
                  {columns[0].map(([categoryId, items]) => {
                    const category = categories.find((c) => c.id === categoryId)
                    if (!category) return null
                    return (
                      <View key={categoryId} style={styles.category}>
                        <Text style={[styles.categoryHeader, { color: effectiveAccent }]}>
                          {category.name}
                        </Text>
                        <View>
                          {items.map((item) => (
                            <View
                              key={item.id}
                              style={[
                                styles.menuItem,
                                { flexDirection: 'row', alignItems: 'center' },
                              ]}
                            >
                              <View style={styles.itemLeft}>
                                <Text
                                  style={[
                                    styles.itemName,
                                    {
                                      color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff',
                                    },
                                  ]}
                                >
                                  {item.name}
                                  {displayOptions.showChefRecommendations &&
                                  item.is_chef_recommendation
                                    ? chefIcon
                                    : ''}
                                </Text>
                                {displayOptions.showDescriptions && item.description && (
                                  <Text
                                    style={[
                                      styles.itemDescription,
                                      {
                                        color: effectiveTheme === 'light' ? '#64748b' : '#94a3b8',
                                      },
                                    ]}
                                  >
                                    {item.description}
                                  </Text>
                                )}
                              </View>
                              {displayOptions.showPrices && (
                                <Text
                                  style={[
                                    styles.itemPrice,
                                    {
                                      color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff',
                                    },
                                  ]}
                                >
                                  {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}
                                  đ
                                </Text>
                              )}
                            </View>
                          ))}
                        </View>
                      </View>
                    )
                  })}
                </View>
                <View style={{ flex: 1 }}>
                  {columns[1].map(([categoryId, items]) => {
                    const category = categories.find((c) => c.id === categoryId)
                    if (!category) return null
                    return (
                      <View key={categoryId} style={styles.category}>
                        <Text style={[styles.categoryHeader, { color: effectiveAccent }]}>
                          {category.name}
                        </Text>
                        <View>
                          {items.map((item) => (
                            <View
                              key={item.id}
                              style={[
                                styles.menuItem,
                                { flexDirection: 'row', alignItems: 'center' },
                              ]}
                            >
                              <View style={styles.itemLeft}>
                                <Text
                                  style={[
                                    styles.itemName,
                                    {
                                      color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff',
                                    },
                                  ]}
                                >
                                  {item.name}
                                  {displayOptions.showChefRecommendations &&
                                  item.is_chef_recommendation
                                    ? chefIcon
                                    : ''}
                                </Text>
                                {displayOptions.showDescriptions && item.description && (
                                  <Text
                                    style={[
                                      styles.itemDescription,
                                      {
                                        color: effectiveTheme === 'light' ? '#64748b' : '#94a3b8',
                                      },
                                    ]}
                                  >
                                    {item.description}
                                  </Text>
                                )}
                              </View>
                              {displayOptions.showPrices && (
                                <Text
                                  style={[
                                    styles.itemPrice,
                                    {
                                      color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff',
                                    },
                                  ]}
                                >
                                  {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}
                                  đ
                                </Text>
                              )}
                            </View>
                          ))}
                        </View>
                      </View>
                    )
                  })}
                </View>
              </View>
            </Page>,
          )
        }
        return pages
      }

      case '2': { // Photo-Forward Premium
        // Create multiple pages
        const pages = []

        for (let pageIndex = 0; pageIndex < Math.ceil(totalItems / itemsPerPage); pageIndex++) {
          const startItem = pageIndex * itemsPerPage
          const endItem = startItem + itemsPerPage
          const pageItems = allItems.slice(startItem, endItem)

          // Group by category for this page
          const pageCategories: Record<string, MenuItem[]> = pageItems.reduce(
            (acc, item) => {
              if (!acc[item.categoryId]) acc[item.categoryId] = []
              acc[item.categoryId].push(item)
              return acc
            },
            {} as Record<string, MenuItem[]>,
          )

          pages.push(
            <Page
              key={pageIndex}
              size={[595, 842]}
              style={[
                styles.page,
                { backgroundColor: effectiveTheme === 'light' ? '#ffffff' : '#1e293b' },
              ]}
            >
              {pageIndex === 0 && (
                <View style={[styles.header, { marginBottom: 32 }]}>
                  <Text
                    style={[
                      styles.title,
                      { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' },
                    ]}
                  >
                    {restaurantInfo.name}
                  </Text>
                  <Text
                    style={[
                      styles.subtitle,
                      { color: effectiveTheme === 'light' ? '#475569' : '#cbd5e1' },
                    ]}
                  >
                    {restaurantInfo.address} • {restaurantInfo.phone}
                  </Text>
                </View>
              )}
              {Object.entries(pageCategories).map(([categoryId, items]) => {
                const category = categories.find((c) => c.id === categoryId)
                if (!category) return null
                return (
                  <View key={categoryId} style={[styles.category, { marginBottom: 12 }]}>
                    <Text
                      style={[styles.categoryHeader, { color: effectiveAccent, marginBottom: 8 }]}
                    >
                      {category.name}
                    </Text>
                    <View>
                      {items.map((item) => (
                        <View
                          key={item.id}
                          style={[
                            styles.menuItem,
                            {
                              marginBottom: 12,
                              padding: 12,
                              backgroundColor: effectiveTheme === 'light' ? '#f1f5f9' : '#334155',
                              borderRadius: 6,
                              borderWidth: 1,
                              borderColor: effectiveTheme === 'light' ? '#e5e7eb' : '#475569',
                              flexDirection: 'row',
                              alignItems: 'flex-start',
                            },
                          ]}
                        >
                          {item.images && item.images.length > 0 && (
                            <View style={{ width: imageSize, height: imageSize, marginRight: 12 }}>
                              <Image
                                src={transformImageUrl(getSelectedImageUrl(item.images))}
                                style={{
                                  width: imageSize,
                                  height: imageSize,
                                  borderRadius: 4,
                                  objectFit: 'cover',
                                }}
                              />
                            </View>
                          )}
                          <View style={{ flex: 1 }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: 4,
                              }}
                            >
                              <Text
                                style={[
                                  styles.itemName,
                                  { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' },
                                ]}
                              >
                                {item.name}
                                {displayOptions.showChefRecommendations &&
                                item.is_chef_recommendation
                                  ? chefIcon
                                  : ''}
                              </Text>
                              {displayOptions.showPrices && (
                                <Text
                                  style={[
                                    styles.itemPrice,
                                    {
                                      color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff',
                                      fontWeight: 'bold',
                                    },
                                  ]}
                                >
                                  {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}
                                  đ
                                </Text>
                              )}
                            </View>
                            {displayOptions.showDescriptions && item.description && (
                              <Text
                                style={[
                                  styles.itemDescription,
                                  { color: effectiveTheme === 'light' ? '#64748b' : '#94a3b8' },
                                ]}
                              >
                                {item.description}
                              </Text>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )
              })}
            </Page>,
          )
        }
        return pages
      }

      case '3': { // Chalkboard Dark
        // Create multiple pages
        const pages = []

        for (let pageIndex = 0; pageIndex < Math.ceil(totalItems / itemsPerPage); pageIndex++) {
          const startItem = pageIndex * itemsPerPage
          const endItem = startItem + itemsPerPage
          const pageItems = allItems.slice(startItem, endItem)

          // Group by category for this page
          const pageCategories: Record<string, MenuItem[]> = pageItems.reduce(
            (acc, item) => {
              if (!acc[item.categoryId]) acc[item.categoryId] = []
              acc[item.categoryId].push(item)
              return acc
            },
            {} as Record<string, MenuItem[]>,
          )

          pages.push(
            <Page
              key={pageIndex}
              size={[595, 842]}
              style={[
                styles.page,
                { backgroundColor: effectiveTheme === 'light' ? '#ffffff' : '#1e293b' },
              ]}
            >
              {pageIndex === 0 && (
                <View style={styles.header}>
                  <Text
                    style={[
                      styles.title,
                      { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' },
                    ]}
                  >
                    {restaurantInfo.name}
                  </Text>
                  <Text
                    style={[
                      styles.subtitle,
                      { color: effectiveTheme === 'light' ? '#475569' : '#cbd5e1' },
                    ]}
                  >
                    {restaurantInfo.address} • {restaurantInfo.phone}
                  </Text>
                </View>
              )}
              {Object.entries(pageCategories).map(([categoryId, items]) => {
                const category = categories.find((c) => c.id === categoryId)
                if (!category) return null
                return (
                  <View
                    key={categoryId}
                    style={[styles.category, { marginTop: pageIndex === 0 ? 0 : 32 }]}
                  >
                    <Text
                      style={[
                        styles.categoryHeader,
                        {
                          color: effectiveAccent,
                          borderBottomColor: effectiveTheme === 'light' ? '#e2e8f0' : '#475569',
                        },
                      ]}
                    >
                      {category.name}
                    </Text>
                    <View>
                      {items.map((item) => (
                        <View key={item.id} style={styles.menuItem}>
                          <View style={styles.itemLeft}>
                            <Text
                              style={[
                                styles.itemName,
                                { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' },
                              ]}
                            >
                              {item.name}
                              {displayOptions.showChefRecommendations && item.is_chef_recommendation
                                ? chefIcon
                                : ''}
                            </Text>
                            {displayOptions.showDescriptions && item.description && (
                              <Text
                                style={[
                                  styles.itemDescription,
                                  { color: effectiveTheme === 'light' ? '#64748b' : '#94a3b8' },
                                ]}
                              >
                                {item.description}
                              </Text>
                            )}
                          </View>
                          {displayOptions.showPrices && (
                            <Text
                              style={[
                                styles.itemPrice,
                                { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' },
                              ]}
                            >
                              {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}đ
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                )
              })}
            </Page>,
          )
        }
        return pages
      }

      case '4': { // Tri-Fold Classic - Horizontal A4 with separators
        const categoriesArray = Object.entries(menuItemsByCategory)

        // Distribute categories into 3 columns, balancing total items
        const distributeCategories = (categories: [string, any[]][], numColumns: number) => {
          // Sort categories by item count descending
          const sortedCategories = categories.sort((a, b) => b[1].length - a[1].length)
          const columns: [string, any[]][][] = Array.from({ length: numColumns }, () => [])
          const columnTotals = Array(numColumns).fill(0)

          for (const category of sortedCategories) {
            // Find column with least items
            const minIndex = columnTotals.indexOf(Math.min(...columnTotals))
            columns[minIndex].push(category)
            columnTotals[minIndex] += category[1].length
          }

          return columns
        }

        const columns = distributeCategories(categoriesArray, 3)

        return (
          <Page size={[842, 595]} style={styles.page}>
            {' '}
            {/* Landscape A4: 297mm x 210mm */}
            <View style={styles.header}>
              <Text
                style={[
                  styles.title,
                  { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' },
                ]}
              >
                {restaurantInfo.name}
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: effectiveTheme === 'light' ? '#475569' : '#cbd5e1' },
                ]}
              >
                {restaurantInfo.address} • {restaurantInfo.phone}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', height: '86%' }}>
              {/* Section 1 */}
              <View
                style={{
                  flex: 1,
                  paddingRight: 10,
                  borderRightWidth: 1,
                  borderRightColor: effectiveTheme === 'light' ? '#e2e8f0' : '#475569',
                }}
              >
                {columns[0].map(([categoryId, items]) => {
                  const category = categories.find((c) => c.id === categoryId)
                  if (!category) return null
                  return (
                    <View key={categoryId} style={styles.category}>
                      <Text style={[styles.categoryHeader, { color: effectiveAccent }]}>
                        {category.name}
                      </Text>
                      <View>
                        {items.slice(0, maxItemsPerPage).map((item) => (
                          <View key={item.id} style={styles.menuItem}>
                            <View style={styles.itemLeft}>
                              <Text
                                style={[
                                  styles.itemName,
                                  { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' },
                                ]}
                              >
                                {item.name}
                                {displayOptions.showChefRecommendations &&
                                item.is_chef_recommendation
                                  ? chefIcon
                                  : ''}
                              </Text>
                              {displayOptions.showDescriptions && item.description && (
                                <Text
                                  style={[
                                    styles.itemDescription,
                                    { color: effectiveTheme === 'light' ? '#64748b' : '#94a3b8' },
                                  ]}
                                >
                                  {item.description}
                                </Text>
                              )}
                            </View>
                            {displayOptions.showPrices && (
                              <Text
                                style={[
                                  styles.itemPrice,
                                  { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' },
                                ]}
                              >
                                {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}đ
                              </Text>
                            )}
                          </View>
                        ))}
                      </View>
                    </View>
                  )
                })}
              </View>

              {/* Section 2 */}
              <View
                style={{
                  flex: 1,
                  paddingHorizontal: 10,
                  borderRightWidth: 1,
                  borderRightColor: effectiveTheme === 'light' ? '#e2e8f0' : '#475569',
                }}
              >
                {columns[1].map(([categoryId, items]) => {
                  const category = categories.find((c) => c.id === categoryId)
                  if (!category) return null
                  return (
                    <View key={categoryId} style={styles.category}>
                      <Text style={[styles.categoryHeader, { color: effectiveAccent }]}>
                        {category.name}
                      </Text>
                      <View>
                        {items.slice(0, maxItemsPerPage).map((item) => (
                          <View key={item.id} style={styles.menuItem}>
                            <View style={styles.itemLeft}>
                              <Text
                                style={[
                                  styles.itemName,
                                  { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' },
                                ]}
                              >
                                {item.name}
                                {displayOptions.showChefRecommendations &&
                                item.is_chef_recommendation
                                  ? chefIcon
                                  : ''}
                              </Text>
                              {displayOptions.showDescriptions && item.description && (
                                <Text
                                  style={[
                                    styles.itemDescription,
                                    { color: effectiveTheme === 'light' ? '#64748b' : '#94a3b8' },
                                  ]}
                                >
                                  {item.description}
                                </Text>
                              )}
                            </View>
                            {displayOptions.showPrices && (
                              <Text
                                style={[
                                  styles.itemPrice,
                                  { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' },
                                ]}
                              >
                                {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}đ
                              </Text>
                            )}
                          </View>
                        ))}
                      </View>
                    </View>
                  )
                })}
              </View>

              {/* Section 3 */}
              <View style={{ flex: 1, paddingLeft: 10 }}>
                {columns[2].map(([categoryId, items]) => {
                  const category = categories.find((c) => c.id === categoryId)
                  if (!category) return null
                  return (
                    <View key={categoryId} style={styles.category}>
                      <Text style={[styles.categoryHeader, { color: effectiveAccent }]}>
                        {category.name}
                      </Text>
                      <View>
                        {items.slice(0, maxItemsPerPage).map((item) => (
                          <View key={item.id} style={styles.menuItem}>
                            <View style={styles.itemLeft}>
                              <Text
                                style={[
                                  styles.itemName,
                                  { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' },
                                ]}
                              >
                                {item.name}
                                {displayOptions.showChefRecommendations &&
                                item.is_chef_recommendation
                                  ? chefIcon
                                  : ''}
                              </Text>
                              {displayOptions.showDescriptions && item.description && (
                                <Text
                                  style={[
                                    styles.itemDescription,
                                    { color: effectiveTheme === 'light' ? '#64748b' : '#94a3b8' },
                                  ]}
                                >
                                  {item.description}
                                </Text>
                              )}
                            </View>
                            {displayOptions.showPrices && (
                              <Text
                                style={[
                                  styles.itemPrice,
                                  { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' },
                                ]}
                              >
                                {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}đ
                              </Text>
                            )}
                          </View>
                        ))}
                      </View>
                    </View>
                  )
                })}
              </View>
            </View>
          </Page>
        )
      }

      default: {
        // Create multiple pages
        const pages = []

        for (let pageIndex = 0; pageIndex < Math.ceil(totalItems / itemsPerPage); pageIndex++) {
          const startItem = pageIndex * itemsPerPage
          const endItem = startItem + itemsPerPage
          const pageItems = allItems.slice(startItem, endItem)

          // Group by category for this page
          const pageCategories: Record<string, MenuItem[]> = pageItems.reduce(
            (acc, item) => {
              if (!acc[item.categoryId]) acc[item.categoryId] = []
              acc[item.categoryId].push(item)
              return acc
            },
            {} as Record<string, MenuItem[]>,
          )

          pages.push(
            <Page key={pageIndex} size={[595, 842]} style={styles.page}>
              {pageIndex === 0 && (
                <View style={styles.header}>
                  <Text style={styles.title}>{restaurantInfo.name}</Text>
                  <Text style={styles.subtitle}>
                    {restaurantInfo.address} • {restaurantInfo.phone}
                  </Text>
                </View>
              )}

              {Object.keys(pageCategories).length === 0 ? (
                <View style={styles.emptyState}>
                  <Text>Chọn danh mục để xem trước</Text>
                </View>
              ) : (
                Object.entries(pageCategories).map(([categoryId, items]) => {
                  const category = categories.find((c) => c.id === categoryId)
                  if (!category) return null

                  return (
                    <View
                      key={categoryId}
                      style={[styles.category, { marginTop: pageIndex === 0 ? 0 : 32 }]}
                    >
                      <Text style={styles.categoryHeader}>{category.name}</Text>
                      <View>
                        {items.map((item) => (
                          <View key={item.id} style={styles.menuItem}>
                            <View style={styles.itemLeft}>
                              <Text style={styles.itemName}>
                                {item.name}
                                {displayOptions.showChefRecommendations &&
                                item.is_chef_recommendation
                                  ? chefIcon
                                  : ''}
                              </Text>
                              {displayOptions.showDescriptions && item.description && (
                                <Text style={styles.itemDescription}>{item.description}</Text>
                              )}
                            </View>
                            {displayOptions.showPrices && (
                              <Text style={styles.itemPrice}>
                                {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}đ
                              </Text>
                            )}
                          </View>
                        ))}
                      </View>
                    </View>
                  )
                })
              )}
            </Page>,
          )
        }
        return pages
      }
    }
  }

  return <Document>{renderTemplateContent()}</Document>
}
