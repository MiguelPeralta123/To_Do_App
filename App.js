import { Provider } from 'react-redux'
import { Store } from './src/redux/store';
import ToDoApp from './src/ToDoApp';

export default function App() {
  return (
    <Provider store={Store}>
      <ToDoApp />
    </Provider>
  );
}
