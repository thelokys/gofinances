import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { HighlightCard } from '../../components/HighlightCard'
import { TransactionCard, TransactionCardProps } from '../../components/TransactionCard'
import { 
  Container,
   Header,
   UserInfo,
   Photo,
   User,
   UserGreeting,
   UserName,
   UserWrapper,
   Icon,
   HighlightCards,
   Transactions,
   Title,
   TransactionList,
   LogoutButton,
   LoadContainer
} from './styles'

import { useTheme } from 'styled-components'
import { useAuth } from '../../hooks/auth'
import { useFocusEffect } from '@react-navigation/native'
import { asBRLCurrency } from '../../utils/money'
import { asBrazilianDate } from '../../utils/date'

export interface DataListProps extends TransactionCardProps{
  id: string;
}

interface HighlightProps {
  amount: string
  lastTransaction: string
}
interface HighlightDataProps {
  entries: HighlightProps,
  expensives: HighlightProps
  total: HighlightProps
}

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<DataListProps[]>([])
  const [highlightData, setHighlightCard] = useState<HighlightDataProps>()
  const theme = useTheme();
  const { signOut, user } = useAuth()


  function getLastTransactionDate(
    collection: DataListProps[],
    type: 'positive' | 'negative'
  ) {

    const collectionFiltered = collection
      .filter(transaction => transaction.type === type)


    if(collectionFiltered.length === 0) {
      return 0
    }

    const lastTransactionDate = new Date(Math.max.apply(
        Math, 
        collectionFiltered
        .map(transaction => new Date(transaction.date).getTime()))
    )
    
    return `${lastTransactionDate.getDate()} de ${lastTransactionDate.toLocaleString('pt-BR', { month: 'long' })}`
  }

  async function loadTransaction() {
    const dataKey = `@gofinances:transactions_user:${user.id}`
    const response = await AsyncStorage.getItem(dataKey)
    const transactions: DataListProps[] = response ? JSON.parse(response): []

    let entriesTotal = 0
    let expensiveTotal = 0

    const transactionsFormatted: DataListProps[] = transactions
      .map((transaction: DataListProps) => {

        if(transaction.type === 'positive') {
          entriesTotal += Number(transaction.amount)
        } else {
          expensiveTotal += Number(transaction.amount) 
        }

        const amountFormatted = asBRLCurrency(Number(transaction.amount))
        const dateFormatted = asBrazilianDate(transaction.date)

        return {
          id: transaction.id,
          name: transaction.name,
          type: transaction.type,
          category: transaction.category,
          amount: amountFormatted,
          date: dateFormatted,
        } as DataListProps
      })

      
      setTransactions(transactionsFormatted)

      const lastEntryDate = getLastTransactionDate(transactions, 'positive')
      const lastExpensiveDate = getLastTransactionDate(transactions, 'negative')
      const totalInterval = lastEntryDate === 0 
        ?  'Não há transações'
        :`01 a ${lastExpensiveDate}`

      getLastTransactionDate(transactions, 'positive')
      const total = entriesTotal - expensiveTotal

      setHighlightCard({
        entries: {
          amount: asBRLCurrency(entriesTotal),
          lastTransaction: lastEntryDate === 0 
            ? '' 
            : `Última transação dia ${lastEntryDate}`
        },
        expensives: {
          amount: asBRLCurrency(expensiveTotal),
          lastTransaction: lastExpensiveDate === 0 
            ? '' 
            : `Última saída dia ${lastExpensiveDate}`
        },
        total: {
          amount: asBRLCurrency(total),
          lastTransaction: totalInterval
        }
      })
      setIsLoading(false)
  }


  useFocusEffect(useCallback(() => {
    loadTransaction();
  },[]));

  return (
    <Container>
      {
        isLoading ? (
          <LoadContainer>
            <ActivityIndicator 
              color={theme.colors.primary}
              size="large"
            />
          </LoadContainer>
          ) :
      <>
        <Header>
          <UserWrapper>
            <UserInfo>
              <Photo source={{ uri: user.photo}}/>
              <User>
                <UserGreeting>Olá, </UserGreeting>
                <UserName>{user.name}</UserName>
              </User>
            </UserInfo>

            <LogoutButton onPress={signOut}>
              <Icon name="power" />
            </LogoutButton>
          </UserWrapper>
        </Header>

        <HighlightCards>
          <HighlightCard 
            type="up"
            title="Entrada"
            amount={highlightData?.entries.amount}
            lastTransaction={highlightData?.entries.lastTransaction}
          />
          
          <HighlightCard 
            type="down"
            title="Saídas"
            amount={highlightData?.expensives.amount}
            lastTransaction={highlightData?.expensives.lastTransaction}
          />

          <HighlightCard 
            type="total"
            title="Total"
            amount={highlightData?.total.amount}
            lastTransaction={highlightData?.total.lastTransaction}
          />
        </HighlightCards>

        <Transactions>
          <Title>Listagem</Title>
          <TransactionList
            data={transactions}
            keyExtractor={(item) => item.id}
            renderItem={({item}) => <TransactionCard data={item} />}
          >
          </TransactionList>
        </Transactions>
      </>
      }
    </Container>
  )
}