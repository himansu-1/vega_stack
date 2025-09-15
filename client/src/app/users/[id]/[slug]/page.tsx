'use client';
import React from "react";
import { useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import Navigation from "@/components/Navigation";
import ProfileDetails from "@/components/ProfileDetails";
import FollowList from "@/components/FloowoList";

export default function UserProfilePage() {
    const { id, slug } = useParams();
    const dispatch = useDispatch();

    return (
        <>
            <Navigation />
            {
                slug === 'followers' && (
                    <FollowList id={id} slug={slug} dispatch={dispatch} />
                ) || slug === 'following' && (
                    <FollowList id={id} slug={slug} dispatch={dispatch} />
                ) || slug === '' && (
                    <ProfileDetails id={id} dispatch={dispatch} />
                )
            }
        </>
    );
}

