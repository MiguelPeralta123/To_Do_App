import { SET_TASKS, SET_TASK_ID } from './actions'

const initialState = {
    tasks: [],
    taskId: 1,
}

const taskReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_TASKS:
            return {
                ...state,
                tasks: action.payload,
            }
            break;
        case SET_TASK_ID:
            return {
                ...state,
                taskID: action.payload,
            }
            break;
        default:
            return state
            break;
    }
}

export default taskReducer;