import { Preloader, OrderInfoUI } from '@ui';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { selectFeedOrders } from '@services/slices/feed';
import { selectIngredients } from '@services/slices/ingredients';
import { fetchOrderByNumber, selectOrderInfo } from '@services/slices/order';
import { selectProfileOrders } from '@services/slices/profile-orders';
import { useDispatch, useSelector } from '@services/store';

import type { TIngredient, TOrder } from '@utils-types';

export const OrderInfo = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { number } = useParams();
  const orderNumber = Number(number);

  /* Заказ ищем в уже загруженных ленте и истории, а при прямом переходе
     по ссылке запрашиваем его с сервера по номеру. */
  const orderData = useSelector((state) => {
    const isSameOrder = ({ number }: Pick<TOrder, 'number'>): boolean =>
      number === orderNumber;
    const loadedOrder = selectOrderInfo(state);

    return (
      selectFeedOrders(state).find(isSameOrder) ??
      selectProfileOrders(state).find(isSameOrder) ??
      (loadedOrder && isSameOrder(loadedOrder) ? loadedOrder : null)
    );
  });

  const ingredients = useSelector(selectIngredients);

  useEffect(() => {
    if (!orderData && orderNumber) {
      void dispatch(fetchOrderByNumber(orderNumber));
    }
  }, [dispatch, orderData, orderNumber]);

  /**
   * использование useMemo не обязательно
   */
  /* Готовим данные для отображения */
  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = Record<string, TIngredient & { count: number }>;

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1,
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total,
    };
  }, [orderData, ingredients]);

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
