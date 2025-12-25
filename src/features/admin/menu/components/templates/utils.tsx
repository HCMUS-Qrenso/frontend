import { Category, MenuItem } from '../../types'
import { pdf, Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer'

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
}) => {
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

    // Calculate pagination
    const getMaxItemsPerPage = (templateId: string) => {
      switch (templateId) {
        case '1':
          return 16 // 2 columns, ~8 per column
        case '2':
          return 8 // Photo-forward, larger items
        case '3':
          return 20 // Simple layout
        case '4':
          return Infinity // Already paginated by categories
        default:
          return 15
      }
    }

    const maxItemsPerPage = getMaxItemsPerPage(templateId || '')

    // Flatten all items for pagination
    const allItems = Object.entries(menuItemsByCategory).flatMap(([categoryId, items]) =>
      items.map((item) => ({ ...item, categoryId })),
    )

    switch (templateId) {
      case '1': // Minimal A4 2-Column
        const totalItems1 = allItems.length
        if (totalItems1 > maxItemsPerPage) {
          // Create multiple pages
          const pages = []
          const itemsPerPage = Math.ceil(totalItems1 / Math.ceil(totalItems1 / maxItemsPerPage))

          for (let pageIndex = 0; pageIndex < Math.ceil(totalItems1 / itemsPerPage); pageIndex++) {
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
                <View
                  style={{ flexDirection: 'row', gap: 20, marginTop: pageIndex === 0 ? 0 : 40 }}
                >
                  <View style={{ flex: 1 }}>
                    {Object.entries(pageCategories)
                      .slice(0, Math.ceil(Object.keys(pageCategories).length / 2))
                      .map(([categoryId, items]) => {
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
                                            color:
                                              effectiveTheme === 'light' ? '#64748b' : '#94a3b8',
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
                                      {new Intl.NumberFormat('vi-VN').format(
                                        parseInt(item.base_price),
                                      )}
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
                    {Object.entries(pageCategories)
                      .slice(Math.ceil(Object.keys(pageCategories).length / 2))
                      .map(([categoryId, items]) => {
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
                                            color:
                                              effectiveTheme === 'light' ? '#64748b' : '#94a3b8',
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
                                      {new Intl.NumberFormat('vi-VN').format(
                                        parseInt(item.base_price),
                                      )}
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
        } else {
          // Single page - original logic
          return (
            <Page size={[595, 842]} style={styles.page}>
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
              <View style={{ flexDirection: 'row', gap: 20 }}>
                <View style={{ flex: 1 }}>
                  {Object.entries(menuItemsByCategory)
                    .slice(0, Math.ceil(Object.keys(menuItemsByCategory).length / 2))
                    .map(([categoryId, items]) => {
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
                                      { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' },
                                    ]}
                                  >
                                    {new Intl.NumberFormat('vi-VN').format(
                                      parseInt(item.base_price),
                                    )}
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
                  {Object.entries(menuItemsByCategory)
                    .slice(Math.ceil(Object.keys(menuItemsByCategory).length / 2))
                    .map(([categoryId, items]) => {
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
                                      { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' },
                                    ]}
                                  >
                                    {new Intl.NumberFormat('vi-VN').format(
                                      parseInt(item.base_price),
                                    )}
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
            </Page>
          )
        }

      case '2': // Photo-Forward Premium
        const totalItems2 = allItems.length
        if (totalItems2 > maxItemsPerPage) {
          // Create multiple pages
          const pages = []
          const itemsPerPage = Math.ceil(totalItems2 / Math.ceil(totalItems2 / maxItemsPerPage))

          for (let pageIndex = 0; pageIndex < Math.ceil(totalItems2 / itemsPerPage); pageIndex++) {
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
                                backgroundColor: effectiveTheme === 'light' ? '#ffffff' : '#334155',
                                borderRadius: 6,
                                borderWidth: 1,
                                borderColor: effectiveTheme === 'light' ? '#e5e7eb' : '#475569',
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                              },
                            ]}
                          >
                            {item.images && item.images.length > 0 && (
                              <View style={{ width: 60, height: 60, marginRight: 12 }}>
                                <Image
                                  src={
                                    item.images.find((img: any) => img.is_primary)?.image_url ||
                                    item.images[0]?.image_url ||
                                    '/placeholder.jpg'
                                  }
                                  style={{
                                    width: 60,
                                    height: 60,
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
                                    {new Intl.NumberFormat('vi-VN').format(
                                      parseInt(item.base_price),
                                    )}
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
        } else {
          // Single page - original logic
          return (
            <Page
              size={[1200, 1600]}
              style={[
                styles.page,
                { backgroundColor: effectiveTheme === 'light' ? '#fafafa' : '#0f172a' },
              ]}
            >
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
              {Object.entries(menuItemsByCategory).map(([categoryId, items]) => {
                const category = categories.find((c) => c.id === categoryId)
                if (!category) return null
                return (
                  <View key={categoryId} style={[styles.category, { marginBottom: 24 }]}>
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
                              backgroundColor: effectiveTheme === 'light' ? '#ffffff' : '#334155',
                              borderRadius: 6,
                              flexDirection: 'row',
                              alignItems: 'flex-start',
                            },
                          ]}
                        >
                          {item.images && item.images.length > 0 && (
                            <View style={{ width: 80, height: 80, marginRight: 12 }}>
                              <Image
                                src={
                                  item.images.find((img: any) => img.is_primary)?.image_url ||
                                  item.images[0]?.image_url ||
                                  '/placeholder.jpg'
                                }
                                style={{
                                  width: 80,
                                  height: 80,
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
            </Page>
          )
        }

      case '3': // Chalkboard Dark
        const totalItems3 = allItems.length
        if (totalItems3 > maxItemsPerPage) {
          // Create multiple pages
          const pages = []
          const itemsPerPage = Math.ceil(totalItems3 / Math.ceil(totalItems3 / maxItemsPerPage))

          for (let pageIndex = 0; pageIndex < Math.ceil(totalItems3 / itemsPerPage); pageIndex++) {
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
              </Page>,
            )
          }
          return pages
        } else {
          // Single page - original logic
          return (
            <Page
              size={[595, 842]}
              style={[
                styles.page,
                { backgroundColor: effectiveTheme === 'light' ? '#ffffff' : '#1e293b' },
              ]}
            >
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
              {Object.entries(menuItemsByCategory).map(([categoryId, items]) => {
                const category = categories.find((c) => c.id === categoryId)
                if (!category) return null
                return (
                  <View key={categoryId} style={styles.category}>
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
            </Page>
          )
        }

      case '4': // Tri-Fold Classic - Horizontal A4 with separators
        const categoriesArray = Object.entries(menuItemsByCategory)
        const itemsPerSection = Math.ceil(categoriesArray.length / 3)

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
                {categoriesArray.slice(0, itemsPerSection).map(([categoryId, items]) => {
                  const category = categories.find((c) => c.id === categoryId)
                  if (!category) return null
                  return (
                    <View key={categoryId} style={styles.category}>
                      <Text style={[styles.categoryHeader, { color: effectiveAccent }]}>
                        {category.name}
                      </Text>
                      <View>
                        {items.slice(0, 15).map((item) => (
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
                {categoriesArray
                  .slice(itemsPerSection, itemsPerSection * 2)
                  .map(([categoryId, items]) => {
                    const category = categories.find((c) => c.id === categoryId)
                    if (!category) return null
                    return (
                      <View key={categoryId} style={styles.category}>
                        <Text style={[styles.categoryHeader, { color: effectiveAccent }]}>
                          {category.name}
                        </Text>
                        <View>
                          {items.slice(0, 15).map((item) => (
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

              {/* Section 3 */}
              <View style={{ flex: 1, paddingLeft: 10 }}>
                {categoriesArray.slice(itemsPerSection * 2).map(([categoryId, items]) => {
                  const category = categories.find((c) => c.id === categoryId)
                  if (!category) return null
                  return (
                    <View key={categoryId} style={styles.category}>
                      <Text style={[styles.categoryHeader, { color: effectiveAccent }]}>
                        {category.name}
                      </Text>
                      <View>
                        {items.slice(0, 15).map((item) => (
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

      default: // Default single column
        const totalItemsDefault = allItems.length
        if (totalItemsDefault > maxItemsPerPage) {
          // Create multiple pages
          const pages = []
          const itemsPerPage = Math.ceil(
            totalItemsDefault / Math.ceil(totalItemsDefault / maxItemsPerPage),
          )

          for (
            let pageIndex = 0;
            pageIndex < Math.ceil(totalItemsDefault / itemsPerPage);
            pageIndex++
          ) {
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
                                  {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}
                                  đ
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
        } else {
          // Single page - original logic
          return (
            <Page size={[595, 842]} style={styles.page}>
              <View style={styles.header}>
                <Text style={styles.title}>{restaurantInfo.name}</Text>
                <Text style={styles.subtitle}>
                  {restaurantInfo.address} • {restaurantInfo.phone}
                </Text>
              </View>

              {Object.keys(menuItemsByCategory).length === 0 ? (
                <View style={styles.emptyState}>
                  <Text>Chọn danh mục để xem trước</Text>
                </View>
              ) : (
                Object.entries(menuItemsByCategory).map(([categoryId, items]) => {
                  const category = categories.find((c) => c.id === categoryId)
                  if (!category) return null

                  return (
                    <View key={categoryId} style={styles.category}>
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
            </Page>
          )
        }
    }
  }

  return <Document>{renderTemplateContent()}</Document>
}
