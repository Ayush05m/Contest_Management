"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { createContest, updateContest } from "@/lib/actions/contest-actions";
import type { Contest } from "@/lib/types";
import { useAppSelector } from "@/lib/redux/store";
import { stat } from "fs";

export default function ContestForm({ contest }: { contest?: Contest }) {
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: contest?.title || "",
    platform: contest?.platform || "",
    category: contest?.category || "",
    description: contest?.description || "",
    rules: contest?.rules || "",
    prizes: contest?.prizes || "",
    website: contest?.website || "",
    startDate: contest?.startDate
      ? new Date(contest.startDate).toISOString().slice(0, 16)
      : "",
    endDate: contest?.endDate
      ? new Date(contest.endDate).toISOString().slice(0, 16)
      : "",
    duration: contest?.duration || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a contest",
        variant: "destructive",
      });
      router.push("/auth/login");
      return;
    }

    // Validate form
    if (
      !formData.title ||
      !formData.platform ||
      !formData.category ||
      !formData.description ||
      !formData.startDate ||
      !formData.endDate
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (contest) {
        await updateContest(contest._id, formData);
        toast({
          title: "Contest updated",
          description: "The contest has been updated successfully",
        });
        router.push(`/contests/${contest._id}`);
      } else {
        const newContestId = await createContest(formData);
        toast({
          title: "Contest created",
          description: "The contest has been created successfully",
        });
        router.push(`/contests/${newContestId}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: contest
          ? "Failed to update contest"
          : "Failed to create contest",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Contest title"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="platform">Platform *</Label>
            <Select
              value={formData.platform}
              onValueChange={(value) => handleSelectChange("platform", value)}
              required
            >
              <SelectTrigger id="platform">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leetcode">LeetCode</SelectItem>
                <SelectItem value="codeforces">Codeforces</SelectItem>
                <SelectItem value="hackerrank">HackerRank</SelectItem>
                <SelectItem value="codechef">CodeChef</SelectItem>
                <SelectItem value="hackerearth">HackerEarth</SelectItem>
                <SelectItem value="topcoder">TopCoder</SelectItem>
                <SelectItem value="kaggle">Kaggle</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleSelectChange("category", value)}
              required
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="algorithms">Algorithms</SelectItem>
                <SelectItem value="data-structures">Data Structures</SelectItem>
                <SelectItem value="machine-learning">
                  Machine Learning
                </SelectItem>
                <SelectItem value="web-development">Web Development</SelectItem>
                <SelectItem value="game-development">
                  Game Development
                </SelectItem>
                <SelectItem value="hackathon">Hackathon</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Contest description"
            rows={4}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="rules">Rules</Label>
          <Textarea
            id="rules"
            name="rules"
            value={formData.rules}
            onChange={handleChange}
            placeholder="Contest rules (optional)"
            rows={3}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="prizes">Prizes</Label>
          <Textarea
            id="prizes"
            name="prizes"
            value={formData.prizes}
            onChange={handleChange}
            placeholder="Contest prizes (optional)"
            rows={3}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="website">Website URL</Label>
          <Input
            id="website"
            name="website"
            type="url"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://example.com/contest"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="startDate">Start Date and Time *</Label>
            <Input
              id="startDate"
              name="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="endDate">End Date and Time *</Label>
            <Input
              id="endDate"
              name="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="e.g. 2 hours, 3 days"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {contest ? "Update Contest" : "Create Contest"}
        </Button>
      </div>
    </form>
  );
}
