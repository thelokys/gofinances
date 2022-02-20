import React, { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { VictoryPie } from 'victory-native'
import { addMonths, subMonths, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { HistoryCard } from "../../components/HistoryCard";

import {
  Container,
  Title,
  Header,
  Content,
  LoadContainer,
  ChartContainer,
  Month,
  MonthSelect,
  MonthSelectButton,
  MonthSelectIcon,
} from './styles'
import { categories } from "../../utils/categories";
import { asBRLCurrency } from "../../utils/money";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator } from "react-native";

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'

import { useTheme } from "styled-components";
import { RFValue } from "react-native-responsive-fontsize";


interface CategoryData {
  key: string
  name: string
  total: number
  totalFormatted: string
  color: string
  percent: string
}

export function Resume() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>([])
  const theme = useTheme(); 

  function handleDateChange(action: 'next'| 'prev') {
    if(action === 'next') {
      setSelectedDate(addMonths(selectedDate, 1))
    } else {
  
      setSelectedDate(subMonths(selectedDate, 1))
    }
  }

  async function loadData() {
    setIsLoading(true)
    const dataKey = "@gofinances:transactions"
    const response = await AsyncStorage.getItem(dataKey)
    const responseFormatted = response ? JSON.parse(response) : []
    
    const expensives = responseFormatted.filter(expensive => 
      expensive.type === 'negative' &&
      new Date(expensive.date).getMonth() === selectedDate.getMonth() &&
      new Date(expensive.date).getFullYear() === selectedDate.getFullYear()
    )

    const expensivesTotal = expensives.reduce(
      (accumulator, expensive) => {
        return  accumulator + Number(expensive.amount)
      }, 0);
      
    const totalByCategory: CategoryData[] = []

      categories.forEach(category => {
        let categorySum = 0;
        expensives.forEach(expensive => {
          if(expensive.category.key === category.key) {
            categorySum += Number(expensive.amount)
          }
        })

        
        if(categorySum > 0) {
          const total = asBRLCurrency(categorySum)
          const percent = (categorySum / expensivesTotal * 100)
          

          totalByCategory.push({
            key: category.key,
            name: category.name,
            total: categorySum,
            totalFormatted: total,
            color: category.color,
            percent: `${percent.toFixed(0)}%`
          })
        }
      })
      setTotalByCategories(totalByCategory)

      setIsLoading(false)
  }

  useFocusEffect(useCallback(() => {
    loadData();
  },[selectedDate]));

  return (
    <Container>
      <Header>
        <Title>Resumo por categoria</Title>
      </Header>
      {
        isLoading ? (
        <LoadContainer>
          <ActivityIndicator
            color={theme.colors.primary}
            size="large"
          />
        </LoadContainer>
        ) :
        <Content
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingHorizontal: 24,
            paddingBottom: useBottomTabBarHeight()
          }}
        >
          <MonthSelect>
            <MonthSelectButton
              onPress={() => handleDateChange("prev")}
            >
              <MonthSelectIcon name="chevron-left"/>
            </MonthSelectButton>

            <Month>{format(selectedDate, 'MMMM, yyyy', { locale: ptBR })}</Month>

            <MonthSelectButton
              onPress={() => handleDateChange("next")}
            >
              <MonthSelectIcon name="chevron-right"/>
            </MonthSelectButton>
          </MonthSelect>

          <ChartContainer>
            <VictoryPie
              data={totalByCategories}
              colorScale={totalByCategories.map(item => item.color)}
              style={{
                labels: { 
                  fontSize: RFValue(18),
                  fontWeight: 'bold',
                  fill: theme.colors.shape
                }
              }}
              labelRadius={50}
              x="percent"
              y="total"
            />
          </ChartContainer>

          {totalByCategories.map(category => (
            <HistoryCard
              key={category.key}
              title={category.name}
              amount={category.totalFormatted}
              color={category.color}
            />
          ))}
        </Content>
      }
    </Container>
  )
}