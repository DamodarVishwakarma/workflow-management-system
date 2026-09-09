import { createApi } from '@reduxjs/toolkit/query/react';
import apiClient from './apiClient';

const axiosBaseQuery = async ({ url, method, data, params, headers }) => {
    try {
        const result = await apiClient({ url, method, data, params, headers });
        return { data: result.data };
    } catch (error) {
        return {
            error: {
                status: error.response?.status || 'FETCH_ERROR',
                data: error.response?.data || { detail: error.message },
            },
        };
    }
};

export const flowboardApi = createApi({
    reducerPath: 'flowboardApi',
    baseQuery: axiosBaseQuery,
    tagTypes: ['Projects', 'Tasks', 'Users', 'Invitations', 'Files', 'Comments'],
    endpoints: (builder) => ({
        login: builder.mutation({ query: (body) => ({ url: '/auth/login', method: 'POST', data: body }) }),
        signup: builder.mutation({ query: (body) => ({ url: '/auth/signup', method: 'POST', data: body }) }),
        validateInvitation: builder.query({ query: (token) => ({ url: `/invitations/validate/${token}`, method: 'GET' }) }),
        getProjects: builder.query({ query: () => ({ url: '/projects', method: 'GET' }), providesTags: ['Projects'] }),
        createProject: builder.mutation({ query: (body) => ({ url: '/projects', method: 'POST', data: body }), invalidatesTags: ['Projects'] }),
        deleteProject: builder.mutation({ query: (id) => ({ url: `/projects/${id}`, method: 'DELETE' }), invalidatesTags: ['Projects', 'Tasks', 'Files'] }),
        getTasks: builder.query({ query: ({ projectId, ...params }) => ({ url: `/projects/${projectId}/tasks`, method: 'GET', params }), providesTags: (result, error, { projectId }) => [{ type: 'Tasks', id: projectId }] }),
        createTask: builder.mutation({ query: ({ projectId, ...body }) => ({ url: `/projects/${projectId}/tasks`, method: 'POST', data: body }), invalidatesTags: (result, error, { projectId }) => [{ type: 'Tasks', id: projectId }] }),
        updateTask: builder.mutation({ query: ({ id, projectId, ...body }) => ({ url: `/tasks/${id}`, method: 'PATCH', data: body }), invalidatesTags: (result, error, { projectId }) => [{ type: 'Tasks', id: projectId }] }),
        deleteTask: builder.mutation({ query: ({ id, projectId }) => ({ url: `/tasks/${id}`, method: 'DELETE' }), invalidatesTags: (result, error, { projectId }) => [{ type: 'Tasks', id: projectId }] }),
        getComments: builder.query({ query: (taskId) => ({ url: `/tasks/${taskId}/comments`, method: 'GET' }), providesTags: (result, error, taskId) => [{ type: 'Comments', id: taskId }] }),
        createComment: builder.mutation({ query: ({ taskId, body }) => ({ url: `/tasks/${taskId}/comments`, method: 'POST', data: { body } }), invalidatesTags: (result, error, { taskId }) => [{ type: 'Comments', id: taskId }] }),
        deleteComment: builder.mutation({ query: ({ id, taskId }) => ({ url: `/comments/${id}`, method: 'DELETE' }), invalidatesTags: (result, error, { taskId }) => [{ type: 'Comments', id: taskId }] }),
        getUsers: builder.query({ query: () => ({ url: '/users', method: 'GET' }), providesTags: ['Users'] }),
        getInvitations: builder.query({ query: () => ({ url: '/invitations', method: 'GET' }), providesTags: ['Invitations'] }),
        createInvitation: builder.mutation({ query: (body) => ({ url: '/invitations', method: 'POST', data: body }), invalidatesTags: ['Invitations'] }),
        getFiles: builder.query({ query: (projectId) => ({ url: `/projects/${projectId}/files`, method: 'GET' }), providesTags: (result, error, projectId) => [{ type: 'Files', id: projectId }] }),
        uploadFile: builder.mutation({ query: ({ projectId, file }) => ({ url: `/projects/${projectId}/files`, method: 'POST', data: file, params: { name: file.name }, headers: { 'Content-Type': file.type || 'application/octet-stream' } }), invalidatesTags: (result, error, { projectId }) => [{ type: 'Files', id: projectId }] }),
        deleteFile: builder.mutation({ query: ({ id, projectId }) => ({ url: `/files/${id}`, method: 'DELETE' }), invalidatesTags: (result, error, { projectId }) => [{ type: 'Files', id: projectId }] }),
    }),
});

export const {
    useLoginMutation,
    useSignupMutation,
    useValidateInvitationQuery,
    useLazyValidateInvitationQuery,
    useGetProjectsQuery,
    useCreateProjectMutation,
    useDeleteProjectMutation,
    useGetTasksQuery,
    useCreateTaskMutation,
    useUpdateTaskMutation,
    useDeleteTaskMutation,
    useGetCommentsQuery,
    useCreateCommentMutation,
    useDeleteCommentMutation,
    useGetUsersQuery,
    useGetInvitationsQuery,
    useCreateInvitationMutation,
    useGetFilesQuery,
    useUploadFileMutation,
    useDeleteFileMutation,
} = flowboardApi;