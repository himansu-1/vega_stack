'use client';
import React, { useEffect } from "react";
import { fetchUser, fetchUserPosts } from "@/store/slices/usersSlice";
import { useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import Navigation from "@/components/Navigation";
import ProfileDetails from "@/components/ProfileDetails";

export default function UserProfilePage() {
    const { id } = useParams();
    const dispatch = useDispatch();

    useEffect(() => {
        // Ensure id is defined and a valid number before dispatching
        if (id && !isNaN(Number(id))) {
            // @ts-expect-error: Suppress type error for dispatching thunk
            dispatch(fetchUser(Number(id)));
            // @ts-expect-error: Suppress type error for dispatching thunk
            dispatch(fetchUserPosts(Number(id)));
        }
    }, [dispatch, id]);

    return (
        <>
            <Navigation />
            <ProfileDetails id={id} dispatch={dispatch} />
        </>
    );
}