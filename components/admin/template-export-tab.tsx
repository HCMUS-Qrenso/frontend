'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, Eye, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCategoriesQuery } from '@/hooks/use-categories-query'
import { useMenuItemsQuery } from '@/hooks/use-menu-items-query'
import type { MenuItem } from '@/types/menu-items'
import type { Category } from '@/types/categories'
import { pdf, Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer'

Font.register({
  family: 'Inter',
  src: '/fonts/Inter.ttf',
});

// Helper function to generate PDF blob
const generatePDFBlob = async (
  restaurantInfo: any,
  menuItemsByCategory: Record<string, any[]>,
  categories: Category[],
  displayOptions: any,
  theme: string,
  accentColor: string,
  quality: 'standard' | 'high' = 'standard',
  templateId: string,
  fontSize: 'small' | 'medium' | 'large' = 'medium'
): Promise<Blob> => {
  const doc = (
    <MenuPDFDocument
      restaurantInfo={restaurantInfo}
      menuItemsByCategory={menuItemsByCategory}
      categories={categories}
      displayOptions={displayOptions}
      theme={theme}
      accentColor={accentColor}
      quality={quality}
      templateId={templateId}
      fontSize={fontSize}
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
  quality = 'standard',
  templateId,
  fontSize = 'medium'
}: {
  restaurantInfo: any
  menuItemsByCategory: Record<string, any[]>
  categories: Category[]
  displayOptions: any
  theme: string
  accentColor: string
  quality?: 'standard' | 'high'
  templateId: string
  fontSize?: 'small' | 'medium' | 'large'
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
      title: 20,
      subtitle: 10,
      categoryHeader: 12,
      itemName: 11,
      itemDescription: 9,
      itemPrice: 11,
      truncationText: 9,
    },
    medium: {
      title: 24,
      subtitle: 12,
      categoryHeader: 14,
      itemName: 12,
      itemDescription: 10,
      itemPrice: 12,
      truncationText: 10,
    },
    large: {
      title: 28,
      subtitle: 14,
      categoryHeader: 16,
      itemName: 13,
      itemDescription: 11,
      itemPrice: 13,
      truncationText: 11,
    },
  }

  const qualityMultiplier = quality === 'high' ? 1.2 : 1
  const fontSizes = {
    title: baseFontSizes[fontSize].title * qualityMultiplier,
    subtitle: baseFontSizes[fontSize].subtitle * qualityMultiplier,
    categoryHeader: baseFontSizes[fontSize].categoryHeader * qualityMultiplier,
    itemName: baseFontSizes[fontSize].itemName * qualityMultiplier,
    itemDescription: baseFontSizes[fontSize].itemDescription * qualityMultiplier,
    itemPrice: baseFontSizes[fontSize].itemPrice * qualityMultiplier,
    truncationText: baseFontSizes[fontSize].truncationText * qualityMultiplier,
  }

  const styles = StyleSheet.create({
    page: {
      padding: quality === 'high' ? 25 : 20,
      backgroundColor: theme === 'light' ? '#ffffff' : '#1e293b',
      color: theme === 'light' ? '#0f172a' : '#f1f5f9',
      fontFamily: 'Inter', // Courier has better Unicode support for Vietnamese than Helvetica
    },
    header: {
      marginBottom: quality === 'high' ? 28 : 24,
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
      marginBottom: quality === 'high' ? 18 : 16,
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
      marginBottom: quality === 'high' ? 10 : 8,
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
      marginTop: quality === 'high' ? 5 : 4,
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
      marginTop: quality === 'high' ? 10 : 8,
    },
    emptyState: {
      textAlign: 'center',
      paddingTop: quality === 'high' ? 40 : 32,
      color: theme === 'light' ? '#64748b' : '#94a3b8',
    },
  })

  // Template-specific rendering
  const renderTemplateContent = () => {
    const effectiveTheme = templateId === '3' ? 'dark' : theme
    const effectiveAccent = templateId === '3' ? '#ffffff' : categoryColor

    // Calculate pagination
    const getMaxItemsPerPage = (templateId: string) => {
      switch (templateId) {
        case '1': return 16 // 2 columns, ~8 per column
        case '2': return 8  // Photo-forward, larger items
        case '3': return 20 // Simple layout
        case '4': return Infinity // Already paginated by categories
        default: return 15
      }
    }

    const maxItemsPerPage = getMaxItemsPerPage(templateId || '')

    // Flatten all items for pagination
    const allItems = Object.entries(menuItemsByCategory).flatMap(([categoryId, items]) =>
      items.map(item => ({ ...item, categoryId }))
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
            const pageCategories: Record<string, MenuItem[]> = pageItems.reduce((acc, item) => {
              if (!acc[item.categoryId]) acc[item.categoryId] = []
              acc[item.categoryId].push(item)
              return acc
            }, {} as Record<string, MenuItem[]>)

            pages.push(
              <Page key={pageIndex} size={[1200, 1600]} style={styles.page}>
                {pageIndex === 0 && (
                  <View style={styles.header}>
                    <Text style={[styles.title, { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' }]}>
                      {restaurantInfo.name}
                    </Text>
                    <Text style={[styles.subtitle, { color: effectiveTheme === 'light' ? '#475569' : '#cbd5e1' }]}>
                      {restaurantInfo.address} • {restaurantInfo.phone}
                    </Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', gap: 20, marginTop: pageIndex === 0 ? 0 : 40 }}>
                  <View style={{ flex: 1 }}>
                    {Object.entries(pageCategories).slice(0, Math.ceil(Object.keys(pageCategories).length / 2)).map(([categoryId, items]) => {
                      const category = categories.find(c => c.id === categoryId)
                      if (!category) return null
                      return (
                        <View key={categoryId} style={styles.category}>
                          <Text style={[styles.categoryHeader, { color: effectiveAccent }]}>
                            {category.name}
                          </Text>
                          <View>
                            {items.map((item) => (
                              <View key={item.id} style={[styles.menuItem, { flexDirection: 'row', alignItems: 'center' }]}>
                                {item.images && item.images.length > 0 && (
                                  <View style={{ width: 40, height: 40, marginRight: 8 }}>
                                    <Image src={item.images[0]} style={{ width: 40, height: 40, borderRadius: 4 }} />
                                  </View>
                                )}
                                <View style={styles.itemLeft}>
                                  <Text style={[styles.itemName, { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' }]}>
                                    {item.name}
                                    {displayOptions.showChefRecommendations && item.is_chef_recommendation ? ' ⭐' : ''}
                                  </Text>
                                  {displayOptions.showDescriptions && item.description && (
                                    <Text style={[styles.itemDescription, { color: effectiveTheme === 'light' ? '#64748b' : '#94a3b8' }]}>
                                      {item.description}
                                    </Text>
                                  )}
                                </View>
                                {displayOptions.showPrices && (
                                  <Text style={[styles.itemPrice, { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' }]}>
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
                  <View style={{ flex: 1 }}>
                    {Object.entries(pageCategories).slice(Math.ceil(Object.keys(pageCategories).length / 2)).map(([categoryId, items]) => {
                      const category = categories.find(c => c.id === categoryId)
                      if (!category) return null
                      return (
                        <View key={categoryId} style={styles.category}>
                          <Text style={[styles.categoryHeader, { color: effectiveAccent }]}>
                            {category.name}
                          </Text>
                          <View>
                            {items.map((item) => (
                              <View key={item.id} style={[styles.menuItem, { flexDirection: 'row', alignItems: 'center' }]}>
                                {item.images && item.images.length > 0 && (
                                  <View style={{ width: 40, height: 40, marginRight: 8 }}>
                                    <Image src={item.images[0]} style={{ width: 40, height: 40, borderRadius: 4 }} />
                                  </View>
                                )}
                                <View style={styles.itemLeft}>
                                  <Text style={[styles.itemName, { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' }]}>
                                    {item.name}
                                    {displayOptions.showChefRecommendations && item.is_chef_recommendation ? ' ⭐' : ''}
                                  </Text>
                                  {displayOptions.showDescriptions && item.description && (
                                    <Text style={[styles.itemDescription, { color: effectiveTheme === 'light' ? '#64748b' : '#94a3b8' }]}>
                                      {item.description}
                                    </Text>
                                  )}
                                </View>
                                {displayOptions.showPrices && (
                                  <Text style={[styles.itemPrice, { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' }]}>
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
          return pages
        } else {
          // Single page - original logic
          return (
            <Page size={[1200, 1600]} style={styles.page}>
              <View style={styles.header}>
                <Text style={[styles.title, { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' }]}>
                  {restaurantInfo.name}
                </Text>
                <Text style={[styles.subtitle, { color: effectiveTheme === 'light' ? '#475569' : '#cbd5e1' }]}>
                  {restaurantInfo.address} • {restaurantInfo.phone}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 20 }}>
                <View style={{ flex: 1 }}>
                  {Object.entries(menuItemsByCategory).slice(0, Math.ceil(Object.keys(menuItemsByCategory).length / 2)).map(([categoryId, items]) => {
                    const category = categories.find(c => c.id === categoryId)
                    if (!category) return null
                    return (
                      <View key={categoryId} style={styles.category}>
                        <Text style={[styles.categoryHeader, { color: effectiveAccent }]}>
                          {category.name}
                        </Text>
                        <View>
                          {items.map((item) => (
                            <View key={item.id} style={[styles.menuItem, { flexDirection: 'row', alignItems: 'center' }]}>
                              {item.images && item.images.length > 0 && (
                                <View style={{ width: 40, height: 40, marginRight: 8 }}>
                                  <Image src={item.images[0]} style={{ width: 40, height: 40, borderRadius: 4 }} />
                                </View>
                              )}
                              <View style={styles.itemLeft}>
                                <Text style={[styles.itemName, { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' }]}>
                                  {item.name}
                                  {displayOptions.showChefRecommendations && item.is_chef_recommendation ? ' ⭐' : ''}
                                </Text>
                                {displayOptions.showDescriptions && item.description && (
                                  <Text style={[styles.itemDescription, { color: effectiveTheme === 'light' ? '#64748b' : '#94a3b8' }]}>
                                    {item.description}
                                  </Text>
                                )}
                              </View>
                              {displayOptions.showPrices && (
                                <Text style={[styles.itemPrice, { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' }]}>
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
                <View style={{ flex: 1 }}>
                  {Object.entries(menuItemsByCategory).slice(Math.ceil(Object.keys(menuItemsByCategory).length / 2)).map(([categoryId, items]) => {
                    const category = categories.find(c => c.id === categoryId)
                    if (!category) return null
                    return (
                      <View key={categoryId} style={styles.category}>
                        <Text style={[styles.categoryHeader, { color: effectiveAccent }]}>
                          {category.name}
                        </Text>
                        <View>
                          {items.map((item) => (
                            <View key={item.id} style={[styles.menuItem, { flexDirection: 'row', alignItems: 'center' }]}>
                              {item.images && item.images.length > 0 && (
                                <View style={{ width: 40, height: 40, marginRight: 8 }}>
                                  <Image src={item.images[0]} style={{ width: 40, height: 40, borderRadius: 4 }} />
                              </View>
                              )}
                              <View style={styles.itemLeft}>
                                <Text style={[styles.itemName, { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' }]}>
                                  {item.name}
                                  {displayOptions.showChefRecommendations && item.is_chef_recommendation ? ' ⭐' : ''}
                                </Text>
                                {displayOptions.showDescriptions && item.description && (
                                  <Text style={[styles.itemDescription, { color: effectiveTheme === 'light' ? '#64748b' : '#94a3b8' }]}>
                                    {item.description}
                                  </Text>
                                )}
                              </View>
                              {displayOptions.showPrices && (
                                <Text style={[styles.itemPrice, { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' }]}>
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
            const pageCategories: Record<string, MenuItem[]> = pageItems.reduce((acc, item) => {
              if (!acc[item.categoryId]) acc[item.categoryId] = []
              acc[item.categoryId].push(item)
              return acc
            }, {} as Record<string, MenuItem[]>)

            pages.push(
              <Page key={pageIndex} size={[1200, 1600]} style={[styles.page, { backgroundColor: effectiveTheme === 'light' ? '#fafafa' : '#1e293b' }]}>
                {pageIndex === 0 && (
                  <View style={[styles.header, { marginBottom: 32 }]}>
                    <Text style={[styles.title, { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff', fontSize: fontSizes.title + 4 }]}>
                      {restaurantInfo.name}
                    </Text>
                    <Text style={[styles.subtitle, { color: effectiveTheme === 'light' ? '#475569' : '#cbd5e1' }]}>
                      {restaurantInfo.address} • {restaurantInfo.phone}
                    </Text>
                  </View>
                )}
                {Object.entries(pageCategories).map(([categoryId, items]) => {
                  const category = categories.find(c => c.id === categoryId)
                  if (!category) return null
                  return (
                    <View key={categoryId} style={[styles.category, { marginBottom: 24, marginTop: pageIndex === 0 ? 0 : 32 }]}>
                      <Text style={[styles.categoryHeader, { color: effectiveAccent, fontSize: fontSizes.categoryHeader + 2, marginBottom: 8 }]}>
                        {category.name}
                      </Text>
                      <View>
                        {items.map((item) => (
                          <View key={item.id} style={[styles.menuItem, { marginBottom: 12, padding: 12, backgroundColor: effectiveTheme === 'light' ? '#ffffff' : '#334155', borderRadius: 6, flexDirection: 'row', alignItems: 'flex-start' }]}>
                            {item.images && item.images.length > 0 && (
                              <View style={{ width: 80, height: 80, marginRight: 12 }}>
                                <Image src={item.images[0]} style={{ width: 80, height: 80, borderRadius: 4 }} />
                              </View>
                            )}
                            <View style={{ flex: 1 }}>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                <Text style={[styles.itemName, { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff', fontSize: fontSizes.itemName + 1 }]}>
                                  {item.name}
                                  {displayOptions.showChefRecommendations && item.is_chef_recommendation ? ' ⭐' : ''}
                                </Text>
                                {displayOptions.showPrices && (
                                  <Text style={[styles.itemPrice, { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff', fontWeight: 'bold' }]}>
                                    {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}đ
                                  </Text>
                                )}
                              </View>
                              {displayOptions.showDescriptions && item.description && (
                                <Text style={[styles.itemDescription, { color: effectiveTheme === 'light' ? '#64748b' : '#94a3b8' }]}>
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
          return pages
        } else {
          // Single page - original logic
          return (
            <Page size={[1200, 1600]} style={[styles.page, { backgroundColor: effectiveTheme === 'light' ? '#fafafa' : '#1e293b' }]}>
              <View style={[styles.header, { marginBottom: 32 }]}>
                <Text style={[styles.title, { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff', fontSize: fontSizes.title + 4 }]}>
                  {restaurantInfo.name}
                </Text>
                <Text style={[styles.subtitle, { color: effectiveTheme === 'light' ? '#475569' : '#cbd5e1' }]}>
                  {restaurantInfo.address} • {restaurantInfo.phone}
                </Text>
              </View>
              {Object.entries(menuItemsByCategory).map(([categoryId, items]) => {
                const category = categories.find(c => c.id === categoryId)
                if (!category) return null
                return (
                  <View key={categoryId} style={[styles.category, { marginBottom: 24 }]}>
                    <Text style={[styles.categoryHeader, { color: effectiveAccent, fontSize: fontSizes.categoryHeader + 2, marginBottom: 8 }]}>
                      {category.name}
                    </Text>
                    <View>
                      {items.map((item) => (
                        <View key={item.id} style={[styles.menuItem, { marginBottom: 12, padding: 12, backgroundColor: effectiveTheme === 'light' ? '#ffffff' : '#334155', borderRadius: 6, flexDirection: 'row', alignItems: 'flex-start' }]}>
                          {item.images && item.images.length > 0 && (
                            <View style={{ width: 80, height: 80, marginRight: 12 }}>
                              <Image src={item.images[0]} style={{ width: 80, height: 80, borderRadius: 4 }} />
                            </View>
                          )}
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                              <Text style={[styles.itemName, { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff', fontSize: fontSizes.itemName + 1 }]}>
                                {item.name}
                                {displayOptions.showChefRecommendations && item.is_chef_recommendation ? ' ⭐' : ''}
                              </Text>
                              {displayOptions.showPrices && (
                                <Text style={[styles.itemPrice, { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff', fontWeight: 'bold' }]}>
                                  {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}đ
                                </Text>
                              )}
                            </View>
                            {displayOptions.showDescriptions && item.description && (
                              <Text style={[styles.itemDescription, { color: effectiveTheme === 'light' ? '#64748b' : '#94a3b8' }]}>
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
            const pageCategories: Record<string, MenuItem[]> = pageItems.reduce((acc, item) => {
              if (!acc[item.categoryId]) acc[item.categoryId] = []
              acc[item.categoryId].push(item)
              return acc
            }, {} as Record<string, MenuItem[]>)

            pages.push(
              <Page key={pageIndex} size={[1200, 1600]} style={[styles.page, { backgroundColor: '#1a1a1a' }]}>
                {pageIndex === 0 && (
                  <View style={styles.header}>
                    <Text style={[styles.title, { color: '#ffffff', fontSize: fontSizes.title + 2 }]}>
                      {restaurantInfo.name}
                    </Text>
                    <Text style={[styles.subtitle, { color: '#cccccc' }]}>
                      {restaurantInfo.address} • {restaurantInfo.phone}
                    </Text>
                  </View>
                )}
                {Object.entries(pageCategories).map(([categoryId, items]) => {
                  const category = categories.find(c => c.id === categoryId)
                  if (!category) return null
                  return (
                    <View key={categoryId} style={[styles.category, { marginTop: pageIndex === 0 ? 0 : 32 }]}>
                      <Text style={[styles.categoryHeader, { color: '#ffffff', borderBottomColor: '#666666' }]}>
                        {category.name}
                      </Text>
                      <View>
                        {items.map((item) => (
                          <View key={item.id} style={styles.menuItem}>
                            <View style={styles.itemLeft}>
                              <Text style={[styles.itemName, { color: '#ffffff' }]}>
                                {item.name}
                                {displayOptions.showChefRecommendations && item.is_chef_recommendation ? ' ⭐' : ''}
                              </Text>
                              {displayOptions.showDescriptions && item.description && (
                                <Text style={[styles.itemDescription, { color: '#aaaaaa' }]}>
                                  {item.description}
                                </Text>
                              )}
                            </View>
                            {displayOptions.showPrices && (
                              <Text style={[styles.itemPrice, { color: '#ffffff' }]}>
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
          return pages
        } else {
          // Single page - original logic
          return (
            <Page size={[1200, 1600]} style={[styles.page, { backgroundColor: '#1a1a1a' }]}>
              <View style={styles.header}>
                <Text style={[styles.title, { color: '#ffffff', fontSize: fontSizes.title + 2 }]}>
                  {restaurantInfo.name}
                </Text>
                <Text style={[styles.subtitle, { color: '#cccccc' }]}>
                  {restaurantInfo.address} • {restaurantInfo.phone}
                </Text>
              </View>
              {Object.entries(menuItemsByCategory).map(([categoryId, items]) => {
                const category = categories.find(c => c.id === categoryId)
                if (!category) return null
                return (
                  <View key={categoryId} style={styles.category}>
                    <Text style={[styles.categoryHeader, { color: '#ffffff', borderBottomColor: '#666666' }]}>
                      {category.name}
                    </Text>
                    <View>
                      {items.map((item) => (
                        <View key={item.id} style={styles.menuItem}>
                          <View style={styles.itemLeft}>
                            <Text style={[styles.itemName, { color: '#ffffff' }]}>
                              {item.name}
                              {displayOptions.showChefRecommendations && item.is_chef_recommendation ? ' ⭐' : ''}
                            </Text>
                            {displayOptions.showDescriptions && item.description && (
                              <Text style={[styles.itemDescription, { color: '#aaaaaa' }]}>
                                {item.description}
                              </Text>
                            )}
                          </View>
                          {displayOptions.showPrices && (
                            <Text style={[styles.itemPrice, { color: '#ffffff' }]}>
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

      case '4': // Tri-Fold Classic
        const categoriesArray = Object.entries(menuItemsByCategory)
        const itemsPerPage = Math.ceil(categoriesArray.length / 3)
        const pages = []
        for (let i = 0; i < 3; i++) {
          const start = i * itemsPerPage
          const end = start + itemsPerPage
          const pageCategories = categoriesArray.slice(start, end)
          pages.push(
            <Page key={i} size="A4" style={styles.page}>
              {i === 0 && (
                <View style={styles.header}>
                  <Text style={[styles.title, { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' }]}>
                    {restaurantInfo.name}
                  </Text>
                  <Text style={[styles.subtitle, { color: effectiveTheme === 'light' ? '#475569' : '#cbd5e1' }]}>
                    {restaurantInfo.address} • {restaurantInfo.phone}
                  </Text>
                </View>
              )}
              {pageCategories.map(([categoryId, items]) => {
                const category = categories.find(c => c.id === categoryId)
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
                            <Text style={[styles.itemName, { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' }]}>
                              {item.name}
                              {displayOptions.showChefRecommendations && item.is_chef_recommendation ? ' ⭐' : ''}
                            </Text>
                            {displayOptions.showDescriptions && item.description && (
                              <Text style={[styles.itemDescription, { color: effectiveTheme === 'light' ? '#64748b' : '#94a3b8' }]}>
                                {item.description}
                              </Text>
                            )}
                          </View>
                          {displayOptions.showPrices && (
                            <Text style={[styles.itemPrice, { color: effectiveTheme === 'light' ? '#0f172a' : '#ffffff' }]}>
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
        return pages

      default: // Default single column
        const totalItemsDefault = allItems.length
        if (totalItemsDefault > maxItemsPerPage) {
          // Create multiple pages
          const pages = []
          const itemsPerPage = Math.ceil(totalItemsDefault / Math.ceil(totalItemsDefault / maxItemsPerPage))

          for (let pageIndex = 0; pageIndex < Math.ceil(totalItemsDefault / itemsPerPage); pageIndex++) {
            const startItem = pageIndex * itemsPerPage
            const endItem = startItem + itemsPerPage
            const pageItems = allItems.slice(startItem, endItem)

            // Group by category for this page
            const pageCategories: Record<string, MenuItem[]> = pageItems.reduce((acc, item) => {
              if (!acc[item.categoryId]) acc[item.categoryId] = []
              acc[item.categoryId].push(item)
              return acc
            }, {} as Record<string, MenuItem[]>)

            pages.push(
              <Page key={pageIndex} size="A3" style={styles.page}>
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
                    const category = categories.find(c => c.id === categoryId)
                    if (!category) return null

                    return (
                      <View key={categoryId} style={[styles.category, { marginTop: pageIndex === 0 ? 0 : 32 }]}>
                        <Text style={styles.categoryHeader}>{category.name}</Text>
                        <View>
                          {items.map((item) => (
                            <View key={item.id} style={styles.menuItem}>
                              <View style={styles.itemLeft}>
                                <Text style={styles.itemName}>
                                  {item.name}
                                  {displayOptions.showChefRecommendations && item.is_chef_recommendation ? ' ⭐' : ''}
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
          return pages
        } else {
          // Single page - original logic
          return (
            <Page size="A3" style={styles.page}>
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
                  const category = categories.find(c => c.id === categoryId)
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
                                {displayOptions.showChefRecommendations && item.is_chef_recommendation ? ' ⭐' : ''}
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

  return (
    <Document>
      {renderTemplateContent()}
    </Document>
  )
}

type Template = {
  id: string
  name: string
  thumbnail: string
  tags: string[]
  description: string
  format: string
}

const templates: Template[] = [
  {
    id: '1',
    name: 'Minimal A4 2-Column',
    thumbnail: '/placeholder.jpg',
    tags: ['A4', '2-col', 'Có ảnh'],
    description: 'Thiết kế tối giản, 2 cột, phù hợp menu có ảnh món',
    format: 'A4',
  },
  {
    id: '2',
    name: 'Photo-Forward Premium',
    thumbnail: '/placeholder.jpg',
    tags: ['A4', 'Ảnh lớn', 'Premium'],
    description: 'Ảnh món nổi bật, phong cách cao cấp',
    format: 'A4',
  },
  {
    id: '3',
    name: 'Chalkboard Dark',
    thumbnail: '/placeholder.jpg',
    tags: ['Dark', 'Vintage', 'Không ảnh'],
    description: 'Phong cách bảng đen cổ điển, không cần ảnh',
    format: 'A4',
  },
  {
    id: '4',
    name: 'Tri-Fold Classic',
    thumbnail: '/placeholder.jpg',
    tags: ['Tri-fold', '3-page', 'Compact'],
    description: 'Menu gấp 3, gọn gàng cho nhà hàng nhỏ',
    format: 'Letter',
  },
]

export function TemplateExportTab() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [zoom, setZoom] = useState(75)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const [isMouseOverCanvas, setIsMouseOverCanvas] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Global wheel event handler to prevent page scroll when over canvas
  useEffect(() => {
    const handleGlobalWheel = (e: WheelEvent) => {
      if (isMouseOverCanvas && canvasRef.current?.contains(e.target as Node)) {
        e.preventDefault()
        e.stopImmediatePropagation()
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
        const newZoom = Math.max(25, Math.min(300, zoom * zoomFactor))
        setZoom(newZoom)
        return false
      }
    }

    if (isMouseOverCanvas) {
      document.addEventListener('wheel', handleGlobalWheel, { passive: false, capture: true })
    }

    return () => {
      document.removeEventListener('wheel', handleGlobalWheel, true)
    }
  }, [isMouseOverCanvas, zoom])

  const [accentColor, setAccentColor] = useState('emerald')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [showPreview, setShowPreview] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: 'Nhà hàng Việt',
    address: '123 Nguyễn Huệ, Q.1, TP.HCM',
    phone: '028 1234 5678'
  })
  const [displayOptions, setDisplayOptions] = useState({
    showPrices: true,
    showDescriptions: true,
    showChefRecommendations: true
  })
  const [exportFormat, setExportFormat] = useState<'pdf'>('pdf')
  const [exportQuality, setExportQuality] = useState<'standard' | 'high'>('standard')
  const [isExporting, setIsExporting] = useState(false)
  const [activeTab, setActiveTab] = useState<'data' | 'style'>('data')
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')

  // Fetch data
  const { data: categoriesData } = useCategoriesQuery({ status: 'active' })
  const { data: menuItemsData } = useMenuItemsQuery({
    status: 'available',
    limit: 100
  })

  const categories = categoriesData?.data.categories || []
  const menuItems = menuItemsData?.data.menu_items || []

  // Auto-select all categories by default
  useEffect(() => {
    if (categories.length > 0) {
      setSelectedCategories(new Set(categories.map(cat => cat.id)))
    }
  }, [categories])

  // Pan and zoom handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - lastMousePos.x
    const deltaY = e.clientY - lastMousePos.y

    setPanX(prev => prev + deltaX)
    setPanY(prev => prev + deltaY)
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(25, Math.min(300, zoom * zoomFactor))
    setZoom(newZoom)
  }

  const resetView = () => {
    setZoom(75)
    setPanX(0)
    setPanY(0)
  }

  // Helper function to render menu content for preview
  const renderMenuContent = () => {
    const fontSizeClasses = {
      small: 'text-xs',
      medium: 'text-sm',
      large: 'text-base'
    }
    const titleSizeClasses = {
      small: 'text-xl',
      medium: 'text-2xl',
      large: 'text-3xl'
    }

    const effectiveTheme = selectedTemplate === '3' ? 'dark' : theme

    // Calculate approximate items per page based on template
    const getMaxItemsPerPage = (templateId: string) => {
      switch (templateId) {
        case '1': return 16 // 2 columns, ~8 per column
        case '2': return 8  // Photo-forward, larger items
        case '3': return 20 // Simple layout
        case '4': return Infinity // Already paginated by categories
        default: return 15
      }
    }

    const maxItemsPerPage = getMaxItemsPerPage(selectedTemplate || '')

    // Flatten all items for pagination
    const allItems = Object.entries(menuItemsByCategory).flatMap(([categoryId, items]) =>
      items.map(item => ({ ...item, categoryId }))
    )

    // Template-specific preview rendering - matching PDF logic exactly
    if (selectedTemplate === '1') {
      // Minimal A4 2-Column - add pagination if too many items
      const totalItems = allItems.length
      if (totalItems > maxItemsPerPage) {
        // Create multiple pages
        const pages = []
        const itemsPerPage = Math.ceil(totalItems / Math.ceil(totalItems / maxItemsPerPage))
        
        for (let pageIndex = 0; pageIndex < Math.ceil(totalItems / itemsPerPage); pageIndex++) {
          const startItem = pageIndex * itemsPerPage
          const endItem = startItem + itemsPerPage
          const pageItems = allItems.slice(startItem, endItem)
          
          // Group by category for this page
          const pageCategories = pageItems.reduce((acc, item) => {
            if (!acc[item.categoryId]) acc[item.categoryId] = []
            acc[item.categoryId].push(item)
            return acc
          }, {} as Record<string, any[]>)

          pages.push(
            <div key={pageIndex} className={cn(
              "flex h-full p-8",
              fontSizeClasses[fontSize],
              effectiveTheme === 'light' ? 'text-slate-900 bg-white' : 'text-slate-100 bg-slate-800'
            )}>
              {pageIndex === 0 && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center">
                  <h1 className={cn(
                    titleSizeClasses[fontSize],
                    "font-bold",
                    effectiveTheme === 'light' ? 'text-slate-900' : 'text-white'
                  )}>
                    {restaurantInfo.name}
                  </h1>
                  <p className={effectiveTheme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                    {restaurantInfo.address} • {restaurantInfo.phone}
                  </p>
                </div>
              )}
              <div className="flex-1 pr-4 mt-16">
                {Object.entries(pageCategories).slice(0, Math.ceil(Object.keys(pageCategories).length / 2)).map(([categoryId, items]) => {
                  const category = categories.find(c => c.id === categoryId)
                  if (!category) return null
                  return (
                    <div key={categoryId} className="mb-4">
                      <h2 className={cn(
                        "mb-2 pb-1 font-bold border-b",
                        effectiveTheme === 'light' ? 'border-slate-200 text-slate-900' : 'border-slate-600 text-white'
                      )}>
                        {category.name}
                      </h2>
                      <div className="space-y-1">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <div className="flex-1">
                              <span className={cn(
                                "font-medium",
                                effectiveTheme === 'light' ? 'text-slate-900' : 'text-white'
                              )}>
                                {item.name}
                                {displayOptions.showChefRecommendations && item.is_chef_recommendation && (
                                  <span className="ml-1 text-amber-500">⭐</span>
                                )}
                              </span>
                              {displayOptions.showDescriptions && item.description && (
                                <p className={cn(
                                  "mt-1",
                                  effectiveTheme === 'light' ? 'text-slate-500' : 'text-slate-400'
                                )}>
                                  {item.description}
                                </p>
                              )}
                            </div>
                            {displayOptions.showPrices && (
                              <span className={cn(
                                "font-semibold ml-2",
                                effectiveTheme === 'light' ? 'text-slate-900' : 'text-white'
                              )}>
                                {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}đ
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex-1 pl-4 mt-16">
                {Object.entries(pageCategories).slice(Math.ceil(Object.keys(pageCategories).length / 2)).map(([categoryId, items]) => {
                  const category = categories.find(c => c.id === categoryId)
                  if (!category) return null
                  return (
                    <div key={categoryId} className="mb-4">
                      <h2 className={cn(
                        "mb-2 pb-1 font-bold border-b",
                        effectiveTheme === 'light' ? 'border-slate-200 text-slate-900' : 'border-slate-600 text-white'
                      )}>
                        {category.name}
                      </h2>
                      <div className="space-y-1">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <div className="flex-1">
                              <span className={cn(
                                "font-medium",
                                effectiveTheme === 'light' ? 'text-slate-900' : 'text-white'
                              )}>
                                {item.name}
                                {displayOptions.showChefRecommendations && item.is_chef_recommendation && (
                                  <span className="ml-1 text-amber-500">⭐</span>
                                )}
                              </span>
                              {displayOptions.showDescriptions && item.description && (
                                <p className={cn(
                                  "mt-1",
                                  effectiveTheme === 'light' ? 'text-slate-500' : 'text-slate-400'
                                )}>
                                  {item.description}
                                </p>
                              )}
                            </div>
                            {displayOptions.showPrices && (
                              <span className={cn(
                                "font-semibold ml-2",
                                effectiveTheme === 'light' ? 'text-slate-900' : 'text-white'
                              )}>
                                {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}đ
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        }
        return pages
      } else {
        // Single page - original logic
        return (
          <div className={cn(
            "flex h-full p-8",
            fontSizeClasses[fontSize],
            effectiveTheme === 'light' ? 'text-slate-900 bg-white' : 'text-slate-100 bg-slate-800'
          )}>
            <div className="flex-1 pr-4">
              {Object.entries(menuItemsByCategory).slice(0, Math.ceil(Object.keys(menuItemsByCategory).length / 2)).map(([categoryId, items]) => {
                const category = categories.find(c => c.id === categoryId)
                if (!category) return null
                return (
                  <div key={categoryId} className="mb-4">
                    <h2 className={cn(
                      "mb-2 pb-1 font-bold border-b",
                      effectiveTheme === 'light' ? 'border-slate-200 text-slate-900' : 'border-slate-600 text-white'
                    )}>
                      {category.name}
                    </h2>
                    <div className="space-y-1">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <div className="flex-1">
                            <span className={cn(
                              "font-medium",
                              effectiveTheme === 'light' ? 'text-slate-900' : 'text-white'
                            )}>
                              {item.name}
                              {displayOptions.showChefRecommendations && item.is_chef_recommendation && (
                                <span className="ml-1 text-amber-500">⭐</span>
                              )}
                            </span>
                            {displayOptions.showDescriptions && item.description && (
                              <p className={cn(
                                "mt-1",
                                effectiveTheme === 'light' ? 'text-slate-500' : 'text-slate-400'
                              )}>
                                {item.description}
                              </p>
                            )}
                          </div>
                          {displayOptions.showPrices && (
                            <span className={cn(
                              "font-semibold ml-2",
                              effectiveTheme === 'light' ? 'text-slate-900' : 'text-white'
                            )}>
                              {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}đ
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex-1 pl-4">
              {Object.entries(menuItemsByCategory).slice(Math.ceil(Object.keys(menuItemsByCategory).length / 2)).map(([categoryId, items]) => {
                const category = categories.find(c => c.id === categoryId)
                if (!category) return null
                return (
                  <div key={categoryId} className="mb-4">
                    <h2 className={cn(
                      "mb-2 pb-1 font-bold border-b",
                      effectiveTheme === 'light' ? 'border-slate-200 text-slate-900' : 'border-slate-600 text-white'
                    )}>
                      {category.name}
                    </h2>
                    <div className="space-y-1">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <div className="flex-1">
                            <span className={cn(
                              "font-medium",
                              effectiveTheme === 'light' ? 'text-slate-900' : 'text-white'
                            )}>
                              {item.name}
                              {displayOptions.showChefRecommendations && item.is_chef_recommendation && (
                                <span className="ml-1 text-amber-500">⭐</span>
                              )}
                            </span>
                            {displayOptions.showDescriptions && item.description && (
                              <p className={cn(
                                "mt-1",
                                effectiveTheme === 'light' ? 'text-slate-500' : 'text-slate-400'
                              )}>
                                {item.description}
                              </p>
                            )}
                          </div>
                          {displayOptions.showPrices && (
                            <span className={cn(
                              "font-semibold ml-2",
                              effectiveTheme === 'light' ? 'text-slate-900' : 'text-white'
                            )}>
                              {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}đ
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      }
    } else if (selectedTemplate === '2') {
      // Photo-Forward Premium - add pagination if too many items
      const totalItems = allItems.length
      if (totalItems > maxItemsPerPage) {
        // Create multiple pages
        const pages = []
        const itemsPerPage = Math.ceil(totalItems / Math.ceil(totalItems / maxItemsPerPage))
        
        for (let pageIndex = 0; pageIndex < Math.ceil(totalItems / itemsPerPage); pageIndex++) {
          const startItem = pageIndex * itemsPerPage
          const endItem = startItem + itemsPerPage
          const pageItems = allItems.slice(startItem, endItem)
          
          // Group by category for this page
          const pageCategories = pageItems.reduce((acc, item) => {
            if (!acc[item.categoryId]) acc[item.categoryId] = []
            acc[item.categoryId].push(item)
            return acc
          }, {} as Record<string, any[]>)

          pages.push(
            <div key={pageIndex} className={cn(
              "flex h-full flex-col p-8",
              fontSizeClasses[fontSize],
              effectiveTheme === 'light' ? 'text-slate-900 bg-slate-50' : 'text-slate-100 bg-slate-900'
            )}>
              {pageIndex === 0 && (
                <div className="mb-8 text-center">
                  <h1 className={cn(
                    titleSizeClasses[fontSize],
                    "font-bold",
                    effectiveTheme === 'light' ? 'text-slate-900' : 'text-white'
                  )}>
                    {restaurantInfo.name}
                  </h1>
                  <p className={effectiveTheme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                    {restaurantInfo.address} • {restaurantInfo.phone}
                  </p>
                </div>
              )}
              <div className="flex-1 space-y-6">
                {Object.entries(pageCategories).map(([categoryId, items]) => {
                  const category = categories.find(c => c.id === categoryId)
                  if (!category) return null
                  return (
                    <div key={categoryId}>
                      <h2 className={cn(
                        "mb-3 pb-2 font-bold text-lg border-b-2",
                        effectiveTheme === 'light' ? 'border-slate-300 text-slate-900' : 'border-slate-600 text-white'
                      )}>
                        {category.name}
                      </h2>
                      <div className="grid grid-cols-1 gap-4">
                        {items.map((item) => (
                          <div key={item.id} className={cn(
                            "flex gap-4 p-4 rounded-lg border",
                            effectiveTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'
                          )}>
                            {item.images && item.images.length > 0 && (
                              <div className="w-20 h-20 flex-shrink-0">
                                <img
                                  src={
                                    typeof item.images[0] === 'string'
                                    ? item.images[0]
                                    : (item.images[0] as any)?.image_url || '/placeholder.svg'
                                  }
                                  alt={item.name}
                                  className="w-full h-full object-cover rounded-md"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <span className={cn(
                                    "font-semibold text-lg",
                                    effectiveTheme === 'light' ? 'text-slate-900' : 'text-white'
                                  )}>
                                    {item.name}
                                    {displayOptions.showChefRecommendations && item.is_chef_recommendation && (
                                      <span className="ml-2 text-amber-500">⭐</span>
                                    )}
                                  </span>
                                  {displayOptions.showDescriptions && item.description && (
                                    <p className={cn(
                                      "mt-2",
                                      effectiveTheme === 'light' ? 'text-slate-600' : 'text-slate-300'
                                    )}>
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                                {displayOptions.showPrices && (
                                  <span className={cn(
                                    "font-bold text-lg ml-4",
                                    effectiveTheme === 'light' ? 'text-slate-900' : 'text-white'
                                  )}>
                                    {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}đ
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        }
        return pages
      } else {
        // Single page - original logic
        return (
          <div className={cn(
            "flex h-full flex-col p-8",
            fontSizeClasses[fontSize],
            effectiveTheme === 'light' ? 'text-slate-900 bg-slate-50' : 'text-slate-100 bg-slate-900'
          )}>
            <div className="mb-8 text-center">
              <h1 className={cn(
                titleSizeClasses[fontSize],
                "font-bold",
                effectiveTheme === 'light' ? 'text-slate-900' : 'text-white'
              )}>
                {restaurantInfo.name}
              </h1>
              <p className={effectiveTheme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                {restaurantInfo.address} • {restaurantInfo.phone}
              </p>
            </div>
            <div className="flex-1 space-y-6">
              {Object.entries(menuItemsByCategory).map(([categoryId, items]) => {
                const category = categories.find(c => c.id === categoryId)
                if (!category) return null
                return (
                  <div key={categoryId}>
                    <h2 className={cn(
                      "mb-3 pb-2 font-bold text-lg border-b-2",
                      effectiveTheme === 'light' ? 'border-slate-300 text-slate-900' : 'border-slate-600 text-white'
                    )}>
                      {category.name}
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                      {items.map((item) => (
                        <div key={item.id} className={cn(
                          "flex gap-4 p-4 rounded-lg border",
                          effectiveTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'
                        )}>
                          {item.images && item.images.length > 0 && (
                            <div className="w-20 h-20 flex-shrink-0">
                              <img
                                src={item.images[0]}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-md"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <span className={cn(
                                  "font-semibold text-lg",
                                  effectiveTheme === 'light' ? 'text-slate-900' : 'text-white'
                                )}>
                                  {item.name}
                                  {displayOptions.showChefRecommendations && item.is_chef_recommendation && (
                                    <span className="ml-2 text-amber-500">⭐</span>
                                  )}
                                </span>
                                {displayOptions.showDescriptions && item.description && (
                                  <p className={cn(
                                    "mt-2",
                                    effectiveTheme === 'light' ? 'text-slate-600' : 'text-slate-300'
                                  )}>
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              {displayOptions.showPrices && (
                                <span className={cn(
                                  "font-bold text-lg ml-4",
                                  effectiveTheme === 'light' ? 'text-slate-900' : 'text-white'
                                )}>
                                  {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}đ
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      }
    } else if (selectedTemplate === '3') {
      // Chalkboard Dark - add pagination if too many items
      const totalItems = allItems.length
      if (totalItems > maxItemsPerPage) {
        // Create multiple pages
        const pages = []
        const itemsPerPage = Math.ceil(totalItems / Math.ceil(totalItems / maxItemsPerPage))
        
        for (let pageIndex = 0; pageIndex < Math.ceil(totalItems / itemsPerPage); pageIndex++) {
          const startItem = pageIndex * itemsPerPage
          const endItem = startItem + itemsPerPage
          const pageItems = allItems.slice(startItem, endItem)
          
          // Group by category for this page
          const pageCategories = pageItems.reduce((acc, item) => {
            if (!acc[item.categoryId]) acc[item.categoryId] = []
            acc[item.categoryId].push(item)
            return acc
          }, {} as Record<string, any[]>)

          pages.push(
            <div key={pageIndex} className={cn(
              "flex h-full flex-col p-8 bg-slate-900 text-white",
              fontSizeClasses[fontSize]
            )}>
              {pageIndex === 0 && (
                <div className="mb-6 text-center">
                  <h1 className={cn(
                    titleSizeClasses[fontSize],
                    "font-bold text-white"
                  )}>
                    {restaurantInfo.name}
                  </h1>
                  <p className="text-gray-300">
                    {restaurantInfo.address} • {restaurantInfo.phone}
                  </p>
                </div>
              )}
              <div className="flex-1 space-y-4">
                {Object.entries(pageCategories).map(([categoryId, items]) => {
                  const category = categories.find(c => c.id === categoryId)
                  if (!category) return null
                  return (
                    <div key={categoryId}>
                      <h2 className="mb-2 pb-1 font-bold text-white border-b border-gray-600">
                        {category.name}
                      </h2>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <div className="flex-1">
                              <span className="font-medium text-white">
                                {item.name}
                                {displayOptions.showChefRecommendations && item.is_chef_recommendation && (
                                  <span className="ml-1 text-amber-500">⭐</span>
                                )}
                              </span>
                              {displayOptions.showDescriptions && item.description && (
                                <p className="mt-1 text-gray-400">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            {displayOptions.showPrices && (
                              <span className="font-semibold ml-2 text-white">
                                {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}đ
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        }
        return pages
      } else {
        // Single page - original logic
        return (
          <div className={cn(
            "flex h-full flex-col p-8 bg-slate-900 text-white",
            fontSizeClasses[fontSize]
          )}>
            <div className="mb-6 text-center">
              <h1 className={cn(
                titleSizeClasses[fontSize],
                "font-bold text-white"
              )}>
                {restaurantInfo.name}
              </h1>
              <p className="text-gray-300">
                {restaurantInfo.address} • {restaurantInfo.phone}
              </p>
            </div>
            <div className="flex-1 space-y-4">
              {Object.entries(menuItemsByCategory).map(([categoryId, items]) => {
                const category = categories.find(c => c.id === categoryId)
                if (!category) return null
                return (
                  <div key={categoryId}>
                    <h2 className="mb-2 pb-1 font-bold text-white border-b border-gray-600">
                      {category.name}
                    </h2>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <div className="flex-1">
                            <span className="font-medium text-white">
                              {item.name}
                              {displayOptions.showChefRecommendations && item.is_chef_recommendation && (
                                <span className="ml-1 text-amber-500">⭐</span>
                              )}
                            </span>
                            {displayOptions.showDescriptions && item.description && (
                              <p className="mt-1 text-gray-400">
                                {item.description}
                              </p>
                            )}
                          </div>
                          {displayOptions.showPrices && (
                            <span className="font-semibold ml-2 text-white">
                              {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}đ
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      }
    } else if (selectedTemplate === '4') {
      // Tri-Fold Classic - matches PDF pagination exactly
      const categoriesArray = Object.entries(menuItemsByCategory)
      const itemsPerPage = Math.ceil(categoriesArray.length / 3)
      const pages = []

      for (let i = 0; i < 3; i++) {
        const start = i * itemsPerPage
        const end = start + itemsPerPage
        const pageCategories = categoriesArray.slice(start, end)

        pages.push(
          <div key={i} className={cn(
            "flex h-full flex-col p-8",
            fontSizeClasses[fontSize],
            effectiveTheme === 'light' ? 'text-slate-900 bg-white' : 'text-slate-100 bg-slate-800'
          )}>
            {i === 0 && (
              <div className="mb-6 text-center">
                <h1 className={cn(
                  titleSizeClasses[fontSize],
                  "font-bold",
                  effectiveTheme === 'light' ? 'text-slate-900' : 'text-white'
                )}>
                  {restaurantInfo.name}
                </h1>
                <p className={effectiveTheme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                  {restaurantInfo.address} • {restaurantInfo.phone}
                </p>
              </div>
            )}
            <div className="flex-1 space-y-4">
              {pageCategories.map(([categoryId, items]) => {
                const category = categories.find(c => c.id === categoryId)
                if (!category) return null
                return (
                  <div key={categoryId}>
                    <h2 className={cn(
                      "mb-2 pb-1 font-bold",
                      effectiveTheme === 'light' 
                        ? 'border-b border-slate-200 text-slate-900' 
                        : 'border-b border-slate-600 text-white'
                    )}>
                      {category.name}
                    </h2>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <div className="flex-1">
                            <span className={cn(
                              "font-medium",
                              effectiveTheme === 'light' ? 'text-slate-900' : 'text-white'
                            )}>
                              {item.name}
                              {displayOptions.showChefRecommendations && item.is_chef_recommendation && (
                                <span className="ml-1 text-amber-500">⭐</span>
                              )}
                            </span>
                            {displayOptions.showDescriptions && item.description && (
                              <p className={cn(
                                "mt-1",
                                effectiveTheme === 'light' ? 'text-slate-500' : 'text-slate-400'
                              )}>
                                {item.description}
                              </p>
                            )}
                          </div>
                          {displayOptions.showPrices && (
                            <span className={cn(
                              "font-semibold ml-2",
                              effectiveTheme === 'light' ? 'text-slate-900' : 'text-white'
                            )}>
                              {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}đ
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      }

      return pages
    } else {
      // Default single column - add pagination if too many items
      const totalItems = allItems.length
      if (totalItems > maxItemsPerPage) {
        // Create multiple pages
        const pages = []
        const itemsPerPage = Math.ceil(totalItems / Math.ceil(totalItems / maxItemsPerPage))
        
        for (let pageIndex = 0; pageIndex < Math.ceil(totalItems / itemsPerPage); pageIndex++) {
          const startItem = pageIndex * itemsPerPage
          const endItem = startItem + itemsPerPage
          const pageItems = allItems.slice(startItem, endItem)
          
          // Group by category for this page
          const pageCategories = pageItems.reduce((acc, item) => {
            if (!acc[item.categoryId]) acc[item.categoryId] = []
            acc[item.categoryId].push(item)
            return acc
          }, {} as Record<string, any[]>)

          pages.push(
            <div key={pageIndex} className={cn(
              "flex h-full flex-col p-8",
              fontSizeClasses[fontSize],
              effectiveTheme === 'light' ? 'text-slate-900' : 'text-slate-100'
            )}>
              {pageIndex === 0 && (
                <div className="mb-6 text-center">
                  <h1 className={cn(
                    titleSizeClasses[fontSize],
                    "font-bold",
                    effectiveTheme === 'light' ? 'text-slate-900' : 'text-white'
                  )}>
                    {restaurantInfo.name}
                  </h1>
                  <p className={effectiveTheme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                    {restaurantInfo.address} • {restaurantInfo.phone}
                  </p>
                </div>
              )}
              <div className="flex-1 space-y-4">
                {Object.entries(pageCategories).map(([categoryId, items]) => {
                  const category = categories.find(c => c.id === categoryId)
                  if (!category) return null

                  return (
                    <div key={categoryId}>
                      <h2 className={cn(
                        "mb-2 pb-1 font-bold",
                        effectiveTheme === 'light' 
                          ? 'border-b border-slate-200' 
                          : 'border-b border-slate-600',
                        accentColor === 'emerald' && (effectiveTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400'),
                        accentColor === 'blue' && (effectiveTheme === 'light' ? 'text-blue-600' : 'text-blue-400'),
                        accentColor === 'amber' && (effectiveTheme === 'light' ? 'text-amber-600' : 'text-amber-400'),
                        accentColor === 'rose' && (effectiveTheme === 'light' ? 'text-rose-600' : 'text-rose-400')
                      )}>
                        {category.name}
                      </h2>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <div className="flex-1">
                              <span className={cn(
                                "font-medium",
                                effectiveTheme === 'light' ? 'text-slate-900' : 'text-white'
                              )}>
                                {item.name}
                                {displayOptions.showChefRecommendations && item.is_chef_recommendation && (
                                  <span className="ml-1 text-amber-500">⭐</span>
                                )}
                              </span>
                              {displayOptions.showDescriptions && item.description && (
                                <p className={cn(
                                  "mt-1",
                                  effectiveTheme === 'light' ? 'text-slate-500' : 'text-slate-400'
                                )}>
                                  {item.description}
                                </p>
                              )}
                            </div>
                            {displayOptions.showPrices && (
                              <span className={cn(
                                "font-semibold ml-2",
                                effectiveTheme === 'light' ? 'text-slate-900' : 'text-white'
                              )}>
                                {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}đ
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
                {Object.keys(pageCategories).length === 0 && (
                  <div className="flex items-center justify-center py-8">
                    <p className={effectiveTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}>
                      Chọn danh mục để xem trước
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        }
        return pages
      } else {
        // Single page - original logic
        return (
          <div className={cn(
            "flex h-full flex-col p-8",
            fontSizeClasses[fontSize],
            effectiveTheme === 'light' ? 'text-slate-900' : 'text-slate-100'
          )}>
            <div className="mb-6 text-center">
              <h1 className={cn(
                titleSizeClasses[fontSize],
                "font-bold",
                effectiveTheme === 'light' ? 'text-slate-900' : 'text-white'
              )}>
                {restaurantInfo.name}
              </h1>
              <p className={effectiveTheme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                {restaurantInfo.address} • {restaurantInfo.phone}
              </p>
            </div>
            <div className="flex-1 space-y-4">
              {Object.entries(menuItemsByCategory).map(([categoryId, items]) => {
                const category = categories.find(c => c.id === categoryId)
                if (!category) return null

                return (
                  <div key={categoryId}>
                    <h2 className={cn(
                      "mb-2 pb-1 font-bold",
                      effectiveTheme === 'light' 
                        ? 'border-b border-slate-200' 
                        : 'border-b border-slate-600',
                      accentColor === 'emerald' && (effectiveTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400'),
                      accentColor === 'blue' && (effectiveTheme === 'light' ? 'text-blue-600' : 'text-blue-400'),
                      accentColor === 'amber' && (effectiveTheme === 'light' ? 'text-amber-600' : 'text-amber-400'),
                      accentColor === 'rose' && (effectiveTheme === 'light' ? 'text-rose-600' : 'text-rose-400')
                    )}>
                      {category.name}
                    </h2>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <div className="flex-1">
                            <span className={cn(
                              "font-medium",
                              effectiveTheme === 'light' ? 'text-slate-900' : 'text-white'
                            )}>
                              {item.name}
                              {displayOptions.showChefRecommendations && item.is_chef_recommendation && (
                                <span className="ml-1 text-amber-500">⭐</span>
                              )}
                            </span>
                            {displayOptions.showDescriptions && item.description && (
                              <p className={cn(
                                "mt-1",
                                effectiveTheme === 'light' ? 'text-slate-500' : 'text-slate-400'
                              )}>
                                {item.description}
                              </p>
                            )}
                          </div>
                          {displayOptions.showPrices && (
                            <span className={cn(
                              "font-semibold ml-2",
                              effectiveTheme === 'light' ? 'text-slate-900' : 'text-white'
                            )}>
                              {new Intl.NumberFormat('vi-VN').format(parseInt(item.base_price))}đ
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
              {Object.keys(menuItemsByCategory).length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <p className={effectiveTheme === 'light' ? 'text-slate-500' : 'text-slate-400'}>
                    Chọn danh mục để xem trước
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      }
    }
  }

  // Export function
  const handleExport = async () => {
    if (!selectedTemplate) return

    setIsExporting(true)
    try {
      // Export as PDF using @react-pdf/renderer for vector text
      const pdfBlob = await generatePDFBlob(
        restaurantInfo,
        menuItemsByCategory,
        categories,
        displayOptions,
        theme,
        accentColor,
        exportQuality,
        selectedTemplate,
        fontSize
      )

      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `menu-${restaurantInfo.name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase()}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Xuất thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.')
    } finally {
      setIsExporting(false)
    }
  }

  // Filter menu items based on selected categories and search
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategories.has(item.category.id)
      
      return matchesSearch && matchesCategory
    })
  }, [menuItems, searchQuery, selectedCategories])

  // Group menu items by category
  const menuItemsByCategory = useMemo(() => {
    const grouped: Record<string, MenuItem[]> = {}
    filteredMenuItems.forEach(item => {
      const categoryId = item.category.id
      if (!grouped[categoryId]) {
        grouped[categoryId] = []
      }
      grouped[categoryId].push(item)
    })
    return grouped
  }, [filteredMenuItems])

  return (
    <div className="space-y-6">
      {!selectedTemplate ? (
        <>
          {/* Template Gallery */}
          <Card className="rounded-2xl border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Chọn template thiết kế
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Các mẫu menu đẹp, print-ready cho nhà hàng
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Badge variant="secondary" className="mr-2">
                    A4
                  </Badge>
                </Button>
                <Button variant="outline" size="sm">
                  <Badge variant="secondary" className="mr-2">
                    Có ảnh
                  </Badge>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="group overflow-hidden rounded-xl border border-slate-200 transition-all hover:border-emerald-500 hover:shadow-lg dark:border-slate-800 dark:hover:border-emerald-600 flex flex-col h-full"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={template.thumbnail || '/placeholder.jpg'}
                      alt={template.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="absolute right-4 bottom-4 left-4 flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                          onClick={() => setShowPreview(true)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Xem
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h4 className="font-medium text-slate-900 dark:text-white">{template.name}</h4>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex-1">
                      {template.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      onClick={() => setSelectedTemplate(template.id)}
                      className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700"
                      size="sm"
                    >
                      Dùng template này
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : (
        <>
          {/* Builder Interface */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {templates.find((t) => t.id === selectedTemplate)?.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Thiết kế menu của bạn</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {templates.find((t) => t.id === selectedTemplate)?.name} <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {templates.map((template) => (
                  <DropdownMenuItem
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    disabled={template.id === selectedTemplate}
                  >
                    {template.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedTemplate(null)}>
                  Chọn template khác
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid gap-6 lg:grid-cols-[300px_1fr] h-full m-6">
            {/* Left Panel: Tabbed Data Source & Style Controls */}
            <Card className="rounded-2xl p-0 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 h-full overflow-hidden">
              {/* Tabs */}
              <div className="border-b border-slate-200 dark:border-slate-700">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('data')}
                    className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 ${
                      activeTab === 'data'
                        ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    Nguồn dữ liệu
                  </button>
                  <button
                    onClick={() => setActiveTab('style')}
                    className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 ${
                      activeTab === 'style'
                        ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    Tuỳ chỉnh style
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'data' && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Tìm món ăn..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Danh mục ({categories.length})</p>
                      <div className="max-h-48 space-y-1 overflow-y-auto">
                        {/* All categories checkbox */}
                        <label className="flex items-center gap-2 text-sm font-medium">
                          <input
                            type="checkbox"
                            ref={(el) => {
                              if (el) {
                                el.indeterminate = selectedCategories.size > 0 && selectedCategories.size < categories.length
                              }
                            }}
                            checked={selectedCategories.size === categories.length && categories.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                // Select all categories
                                setSelectedCategories(new Set(categories.map(cat => cat.id)))
                              } else {
                                // Deselect all categories
                                setSelectedCategories(new Set())
                              }
                            }}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-slate-700 dark:text-slate-300">
                            Tất cả ({selectedCategories.size}/{categories.length})
                          </span>
                        </label>
                        {categories.map((category) => (
                          <label key={category.id} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedCategories.has(category.id)}
                              onChange={(e) => {
                                const newSelected = new Set(selectedCategories)
                                if (e.target.checked) {
                                  newSelected.add(category.id)
                                } else {
                                  newSelected.delete(category.id)
                                }
                                setSelectedCategories(newSelected)
                              }}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-slate-700 dark:text-slate-300">
                              {category.name} ({category.item_count})
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Trạng thái
                      </p>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-slate-700 dark:text-slate-300">
                          Ẩn món hết hàng/không khả dụng
                        </span>
                      </label>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Tổng số món: {filteredMenuItems.length}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {Object.keys(menuItemsByCategory).length} danh mục được chọn
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'style' && (
                  <div className="space-y-6">
                    {/* Theme */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Giao diện
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setTheme('light')}
                          className={cn(
                            'rounded-lg border-2 p-3 text-sm transition-all',
                            theme === 'light'
                              ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-500/10'
                              : 'border-slate-200 dark:border-slate-700',
                          )}
                        >
                          Sáng
                        </button>
                        <button
                          onClick={() => setTheme('dark')}
                          className={cn(
                            'rounded-lg border-2 p-3 text-sm transition-all',
                            theme === 'dark'
                              ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-500/10'
                              : 'border-slate-200 dark:border-slate-700',
                          )}
                        >
                          Tối
                        </button>
                      </div>
                    </div>

                    {/* Accent Color */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Màu nhấn
                      </label>
                      <div className="flex gap-2">
                        {['emerald', 'blue', 'amber', 'rose'].map((color) => (
                          <button
                            key={color}
                            onClick={() => setAccentColor(color)}
                            className={cn(
                              'h-10 w-10 rounded-lg border-2 transition-all',
                              accentColor === color
                                ? 'scale-110 border-slate-900 dark:border-white'
                                : 'border-transparent',
                              color === 'emerald' && 'bg-emerald-500',
                              color === 'blue' && 'bg-blue-500',
                              color === 'amber' && 'bg-amber-500',
                              color === 'rose' && 'bg-rose-500',
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Header */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Thông tin nhà hàng
                      </label>
                      <input
                        type="text"
                        placeholder="Tên nhà hàng"
                        value={restaurantInfo.name}
                        onChange={(e) => setRestaurantInfo(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Địa chỉ"
                        value={restaurantInfo.address}
                        onChange={(e) => setRestaurantInfo(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Hotline"
                        value={restaurantInfo.phone}
                        onChange={(e) => setRestaurantInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    {/* Quality */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Chất lượng xuất
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setExportQuality('standard')}
                          className={cn(
                            'rounded-lg border-2 p-3 text-sm transition-all',
                            exportQuality === 'standard'
                              ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-500/10'
                              : 'border-slate-200 dark:border-slate-700',
                          )}
                        >
                          Tiêu chuẩn
                        </button>
                        <button
                          onClick={() => setExportQuality('high')}
                          className={cn(
                            'rounded-lg border-2 p-3 text-sm transition-all',
                            exportQuality === 'high'
                              ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-500/10'
                              : 'border-slate-200 dark:border-slate-700',
                          )}
                        >
                          Cao cấp
                        </button>
                      </div>
                    </div>
                    {/* Options */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Hiển thị
                      </label>
                      <div className="space-y-2 text-sm">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={displayOptions.showPrices}
                            onChange={(e) => setDisplayOptions(prev => ({ ...prev, showPrices: e.target.checked }))}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-slate-700 dark:text-slate-300">Hiển thị giá</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={displayOptions.showDescriptions}
                            onChange={(e) => setDisplayOptions(prev => ({ ...prev, showDescriptions: e.target.checked }))}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-slate-700 dark:text-slate-300">Hiển thị mô tả</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={displayOptions.showChefRecommendations}
                            onChange={(e) => setDisplayOptions(prev => ({ ...prev, showChefRecommendations: e.target.checked }))}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-slate-700 dark:text-slate-300">
                            Biểu tượng món chef yêu thích
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Middle: Preview */}
            <div className="flex-1 flex flex-col">
              <Card className="flex-1 p-0 gap-0 rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex flex-col overflow-hidden">
                {/* Preview Toolbar */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">A4 • 210×297mm</Badge>
                    <Badge variant="secondary">
                      {(() => {
                        if (selectedTemplate === '4') return 3
                        
                        // Calculate pages for other templates based on content
                        const allItems = Object.entries(menuItemsByCategory).flatMap(([categoryId, items]) => 
                          items.map(item => ({ ...item, categoryId }))
                        )
                        const maxItemsPerPage = selectedTemplate === '1' ? 16 : selectedTemplate === '2' ? 8 : selectedTemplate === '3' ? 20 : 15
                        return allItems.length <= maxItemsPerPage ? 1 : Math.ceil(allItems.length / maxItemsPerPage)
                      })()} trang
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Reset View */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetView}
                      className="h-8"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Đặt lại
                    </Button>

                    {/* Font Size */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Font: {fontSize === 'small' ? 'Nhỏ' : fontSize === 'medium' ? 'Trung bình' : 'Lớn'} <ChevronDown className="ml-1 h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setFontSize('small')}>
                          Nhỏ
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFontSize('medium')}>
                          Trung bình
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFontSize('large')}>
                          Lớn
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Export Controls */}
                    <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-200 dark:border-slate-700">
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={handleExport}
                        disabled={isExporting || Object.keys(menuItemsByCategory).length === 0}
                        size="sm"
                      >
                        {isExporting ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Đang xuất...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Xuất PDF
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Preview Canvas - Full Width */}
                <div 
                  ref={canvasRef}
                  className={cn(
                    "flex-1 bg-slate-100 dark:bg-slate-800 pt-8 overflow-hidden min-h-[600px] select-none",
                    isDragging ? "cursor-grabbing" : "cursor-default"
                  )}
                  style={{ overscrollBehavior: 'none' }}
                  onMouseEnter={() => setIsMouseOverCanvas(true)}
                  onMouseLeave={() => {
                    setIsMouseOverCanvas(false)
                    handleMouseUp()
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onWheelCapture={handleWheel}
                >
                  <div 
                    className="w-full h-full relative flex"
                    style={{
                      left: '50%',
                      transform: 'translate(-50%, 0)',
                      transformOrigin: 'top center'
                    }}
                  >
                    {/* Multi-page Preview for templates that create multiple pages */}
                    {(() => {
                      const content = renderMenuContent()
                      if (Array.isArray(content)) {
                        // Multi-page template (like Tri-Fold) - display horizontally
                        return content.map((pageContent, index) => (
                          <div
                            key={index}
                            className={cn(
                              "preview-canvas shadow-2xl absolute",
                              theme === 'light' ? 'bg-white' : 'bg-slate-800'
                            )}
                            style={{
                              width: '794px', // 210mm at 96dpi
                              height: '1123px', // 297mm at 96dpi
                              left: `${index * 894 * (zoom / 100)}px`,
                              top: '0',
                              transform: `translate(${panX}px, ${panY}px) scale(${zoom / 100})`,
                              transformOrigin: 'top center'
                            }}
                          >
                            {pageContent}
                          </div>
                        ))
                      } else {
                        // Single page template
                        return (
                          <div
                            className={cn(
                              "preview-canvas shadow-2xl absolute",
                              theme === 'light' ? 'bg-white' : 'bg-slate-800'
                            )}
                            style={{
                              width: '794px',
                              height: '1123px',
                              left: '0',
                              top: '0',
                              transform: `translate(${panX}px, ${panY}px) scale(${zoom / 100})`,
                              transformOrigin: 'top center'
                            }}
                          >
                            {content}
                          </div>
                        )
                      }
                    })()}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
