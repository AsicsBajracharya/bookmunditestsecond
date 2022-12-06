import {
  FormEventHandler,
  useEffect,
  useReducer,
  useState,
  useRef,
} from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { Card, Typography, Form, Input, Button } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { useImmerReducer } from "use-immer";

const { Paragraph } = Typography;

interface ITodo {
  id: number;
  name: string;
  isCompleted: boolean;
}

interface IAction {
  type: string;
  id?: number;
  value?: string;
  list?: ITodo[];
}

enum ActionType {
  LOAD_ITEM = "LOAD_ITEM",
}

export default function Home() {
  const initialState: ITodo[] = [];
  const [todoToEdit, setTodoToEdit] = useState<ITodo | null>(null);
  const isEditMode = !!todoToEdit?.id;
  const [isSavedLocally, setIsSavedLocally] = useState<Boolean>(false);
  const [isDeletedLocally, setIsDeletedLocally] = useState<Boolean>(false);
  const [message, setMessage] = useState<string>("");

  const todoRef = useRef() as React.MutableRefObject<HTMLInputElement>;

  const ourReducer = (draft: ITodo[], action: IAction) => {
    switch (action.type) {
      case ActionType.LOAD_ITEM:
        return action.list;
      case "ADD-ITEM":
        draft.push({
          id: draft.length + 1,
          name: action.value as string,
          isCompleted: false,
        });
        return draft;
      case "DELETE-ITEM":
        draft = draft.filter((el) => el.id !== action.id);
        return draft;
      case "EDIT-ITEM":
        const itemToEdit = draft.find((el) => el.id === action.id);
        if (itemToEdit) {
          itemToEdit.name = action.value as string;
        }
        break;
      case "COMPLETE-ITEM":
        const itemToComplete = draft.find((el) => el.id === action.id);
        if (itemToComplete) {
          itemToComplete.isCompleted = !itemToComplete.isCompleted;
        }
        break;
      case "SAVE-ITEM":
        break;
      default:
        throw new Error("Out of range");
    }
  };

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (!todoRef.current) {
      return;
    }

    if (isEditMode) {
      dispatch({
        type: "EDIT-ITEM",
        id: todoToEdit.id,
        value: todoRef.current?.value,
      });
      setTodoToEdit(null);
    } else {
      dispatch({
        type: "ADD-ITEM",
        value: todoRef.current?.value,
      });
    }

    todoRef.current.value = "";
  };

  const handleDelete = (id: number) => {
    dispatch({
      id,
      type: "DELETE-ITEM",
    });
  };

  const handleMarkAsComplete = (id: number) => {
    dispatch({
      id,
      type: "COMPLETE-ITEM",
    });
  };

  useEffect(() => {
    if (todoToEdit?.name) {
      todoRef.current.value = todoToEdit.name;
      todoRef.current.focus();
    }
  }, [todoToEdit]);

  const handleSave = () => {
    if (!state.length) {
      setMessage("Nothing to save, Please add items");
      return;
    }
    window.localStorage.setItem("todoList", JSON.stringify(state));
    setMessage("Items saved locally");
  };

  const handleDeleteLocal = () => {
    if (!window.localStorage.getItem("todoList")) {
      setMessage("Nothing to delete from the storage..");
      return;
    }
    window.localStorage.removeItem("todoList");
    setMessage("Items deleted Locally");
  };

  useEffect(() => {
    const storedTodoList = window.localStorage.getItem("todoList");
    if (!storedTodoList) {
      return;
    }

    try {
      const list = JSON.parse(storedTodoList);
      dispatch({
        type: ActionType.LOAD_ITEM,
        list,
      });
    } catch (err) {
      throw new Error("Parsing error");
    }
  }, []);

  useEffect(() => {
    if (message.length) {
      window.setTimeout(() => {
        setMessage("");
      }, 2000);
    }
  }, [message]);

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <input ref={todoRef} name="todo" placeholder="Add a name" />
        <button type="submit" className="primary">
          {isEditMode ? "Update" : "Add"}
        </button>
      </form>

      {state.map((todo) => (
        <div key={todo.id} style={{ display: "flex", alignItems: "center" }}>
          <p style={{ marginRight: "20px", fontSize: "20px" }}>{todo.name}</p>
          {todoToEdit?.id === todo.id ? (
            <span>Update in progress</span>
          ) : (
            <>
              <button
                className="primary"
                type="button"
                onClick={() => setTodoToEdit(todo)}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleMarkAsComplete(todo.id)}
                disabled={todo.isCompleted}
              >
                {todo.isCompleted ? "Completed" : "Mark as Complete"}
              </button>
              <button type="button" onClick={() => handleDelete(todo.id)}>
                Delete
              </button>
            </>
          )}
        </div>
      ))}

      <div className="button-group" style={{ marginTop: "20px" }}>
        <button type="button" onClick={handleSave}>
          Save Locally
        </button>
        <button type="button" onClick={handleDeleteLocal}>
          Delete Locally
        </button>
      </div>
      {message && <p>{message}</p>}
    </div>
  );

  // return (
  //   <div className={styles.container}>
  //     <Head>
  //       <title>Bookmundi Test 2 - Todo app</title>
  //       <meta name="description" content="Generated by create next app" />
  //       <link rel="icon" href="/favicon.ico" />
  //     </Head>
  //     <header>
  //       <h1>Todo App!!!</h1>
  //     </header>

  //     <main className={styles.main}>
  //       {state?.map((item, i) => {
  //         return (
  //           <Card key={item.id}>
  //             <label htmlFor={`Todos ${item.id}`}>{`Todos ${item.id}`}</label>
  //             <input
  //               type="text"
  //               onChange={(e) =>
  //                 dispatch({
  //                   type: "EDIT-ITEM",
  //                   value: e.target.value,
  //                   id: item.id,
  //                 })
  //               }
  //             />
  //             <button
  //               onClick={() => dispatch({ type: "ADD-SINGLE", id: item.id })}
  //             >
  //               add
  //             </button>
  //             <button>edit</button>
  //             <button>remove</button>
  //           </Card>
  //         );
  //       })}
  //       <Card>
  //         <Paragraph>Add Item</Paragraph>
  //         <PlusCircleOutlined style={{ cursor: "pointer" }} onClick={addItem} />
  //       </Card>
  //     </main>
  //   </div>
  // );
}
