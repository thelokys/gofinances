import React, { useState, useEffect } from 'react'
import {
  Keyboard,
  Modal,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native'

import * as Yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup"
import AsyncStorage from '@react-native-async-storage/async-storage'
import uuid from 'react-native-uuid'

import { useForm } from 'react-hook-form'
import { useNavigation } from '@react-navigation/native'

import { Button } from '../../components/Forms/Button'
import { InputForm } from '../../components/Forms/InputForm'
import { TransacationTypeButton } from '../../components/Forms/TransacationTypeButton'
import { CategorySelectButton } from '../../components/Forms/CategorySelectButton'

import { CategorySelect } from '../CategorySelect'

import {
  Container,
  Header,
  Title,
  Form,
  Fields,
  TransacationTypes,
} from './styles'

interface FormData {
  name: string;
  amount: number;
}


const schema = Yup.object().shape({
  name: Yup
    .string()
    .required("Nome é obrigatório"),
  amount: Yup
    .number()
    .typeError("Informe um valor númerico")
    .positive("O valor não pode ser negativo")
})


export function Register() {
  const [transactionType, setTransactionType] = useState('');
  const [categoryModalOpen,setCategoryModalOpen] = useState(false);

  const [category, setCategory] = useState({
    key: "category",
    name: "Category",
  });

  const navigation = useNavigation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  function handleTransacationTypesSelect(type: "up" | "down") {
    setTransactionType(type)
  }

  function handleOpenSelectCategoryModal() {
    setCategoryModalOpen(true)
  }

  function handleCloseSelectCategoryModal() {
    setCategoryModalOpen(false)
  }

  async function handleRegister(form: FormData) {

    if(!transactionType) {
      return Alert.alert("Selecione o tipo da transaçao");
    }

    if(category.key === 'category') {
      return Alert.alert("Selecione a categoria")
    }

    const newTransaction = {
      id: String(uuid.v4()),
      name: form.name,
      amount: form.amount,
      transactionType,
      category: category.key,
      date: new Date()
    }


    try {
      const dataKey = "@gofinances:transactions"
      const data = await AsyncStorage.getItem(dataKey);
      const currentData = data ? JSON.parse(data): []

      const dataFormatted = [
        ...currentData,
        newTransaction
      ]

      await AsyncStorage.setItem(dataKey, JSON.stringify(dataFormatted));
      
      reset()
      setTransactionType('')
      setCategory({
        key: "category",
        name: "Category",
      })
 
      navigation.navigate("Listagem");

    } catch (error) {
      console.log(error)
      Alert.alert("Não foi possível salvar")
    }

  }



  return (
  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <Container>
      <Header>
        <Title>Cadastro</Title>
      </Header>

      <Form>
        <Fields>
          <InputForm
            name="name"
            control={control}
            placeholder="Nome"
            autoCapitalize="sentences"
            autoCorrect={false}
            error={errors.name && errors.name.message}
          />
          <InputForm
            name="amount"
            control={control}
            placeholder="Preço"
            keyboardType="numeric"
            error={errors.amount && errors.amount.message}
          />
          
          <TransacationTypes>
            <TransacationTypeButton
              isActive={transactionType === 'up'}
              type="up"
              title='Income'
              onPress={() => handleTransacationTypesSelect('up')}
            />
            <TransacationTypeButton 
              isActive={transactionType === 'down'}
              type="down"
              title='Outcome'
              onPress={() => handleTransacationTypesSelect('down')}
            />
          </TransacationTypes>
          <CategorySelectButton 
            title={category.name}
            onPress={handleOpenSelectCategoryModal}
          />
        </Fields>
        <Button 
          title="Enviar"
          onPress={handleSubmit(handleRegister)}
        />
      </Form>
      <Modal visible={categoryModalOpen} statusBarTranslucent>
        <CategorySelect 
          category={category}
          setCategory={setCategory}
          closeSelectCategory={handleCloseSelectCategoryModal}
        />    
      </Modal>
    </Container>
  </TouchableWithoutFeedback>
  )
}