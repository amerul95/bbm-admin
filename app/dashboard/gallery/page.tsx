"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IconPlus, IconUpload, IconPhoto, IconFolder, IconX } from "@tabler/icons-react"
import { toast } from "sonner"

type Image = {
  id: string
  url: string
  filename: string
  albumId: string | null
  createdAt: string
}

type Album = {
  id: string
  name: string
  description: string | null
  coverUrl: string | null
  images: Image[]
}

export default function GalleryPage() {
  const [images, setImages] = useState<Image[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState<string | "all">("all")
  const [newAlbumName, setNewAlbumName] = useState("")
  const [newAlbumDesc, setNewAlbumDesc] = useState("")
  const [createAlbumOpen, setCreateAlbumOpen] = useState(false)
  const [uploadAlbumId, setUploadAlbumId] = useState<string | "">("")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function fetchData() {
    try {
      const [imagesRes, albumsRes] = await Promise.all([
        fetch("/api/gallery"),
        fetch("/api/albums"),
      ])
      if (imagesRes.ok) setImages(await imagesRes.json())
      if (albumsRes.ok) setAlbums(await albumsRes.json())
    } catch {
      toast.error("Failed to load gallery")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function handleCreateAlbum(e: React.FormEvent) {
    e.preventDefault()
    if (!newAlbumName.trim()) return
    try {
      const res = await fetch("/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newAlbumName.trim(),
          description: newAlbumDesc.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error("Failed to create album")
      toast.success("Album created")
      setNewAlbumName("")
      setNewAlbumDesc("")
      setCreateAlbumOpen(false)
      fetchData()
    } catch {
      toast.error("Failed to create album")
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return
    const fileList = Array.from(files)
    setPendingFiles((prev) => [...prev, ...fileList])
    const urls = fileList.map((f) => URL.createObjectURL(f))
    setPreviewUrls((prev) => [...prev, ...urls])
    e.target.value = ""
  }

  function removePendingFile(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => {
      const next = [...prev]
      URL.revokeObjectURL(next[index])
      next.splice(index, 1)
      return next
    })
  }

  function clearPendingAndClose() {
    previewUrls.forEach((url) => URL.revokeObjectURL(url))
    setPreviewUrls([])
    setPendingFiles([])
    setUploadAlbumId("")
    setUploadDialogOpen(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleUploadClick() {
    if (!pendingFiles.length) return
    setUploading(true)
    try {
      for (const file of pendingFiles) {
        const fd = new FormData()
        fd.append("file", file)
        if (uploadAlbumId) fd.append("albumId", uploadAlbumId)
        const res = await fetch("/api/gallery/upload", {
          method: "POST",
          body: fd,
        })
        if (!res.ok) throw new Error("Upload failed")
      }
      toast.success("Images uploaded")
      clearPendingAndClose()
      fetchData()
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const displayImages =
    selectedAlbum === "all"
      ? images
      : images.filter((img) => img.albumId === selectedAlbum)

  if (loading) {
    return (
      <div className="flex flex-1 flex-col p-4 md:p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Gallery & Albums</h1>
        <div className="flex gap-2">
          <Dialog open={createAlbumOpen} onOpenChange={setCreateAlbumOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <IconFolder className="mr-2 size-4" />
                New Album
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateAlbum}>
                <DialogHeader>
                  <DialogTitle>Create Album</DialogTitle>
                  <DialogDescription>
                    Create a new album to organize your images
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="album-name">Name</Label>
                    <Input
                      id="album-name"
                      value={newAlbumName}
                      onChange={(e) => setNewAlbumName(e.target.value)}
                      placeholder="Album name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="album-desc">Description (optional)</Label>
                    <Textarea
                      id="album-desc"
                      value={newAlbumDesc}
                      onChange={(e) => setNewAlbumDesc(e.target.value)}
                      placeholder="Album description"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateAlbumOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog
            open={uploadDialogOpen}
            onOpenChange={(open) => {
              setUploadDialogOpen(open)
              if (!open) {
                previewUrls.forEach((url) => URL.revokeObjectURL(url))
                setPreviewUrls([])
                setPendingFiles([])
                setUploadAlbumId("")
                if (fileInputRef.current) fileInputRef.current.value = ""
              }
            }}
          >
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <IconUpload className="mr-2 size-4" />
                Upload Images
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Images</DialogTitle>
                <DialogDescription>
                  Select images to preview, then click Upload to add them to the gallery.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select Images
                  </Button>
                  {albums.length > 0 && (
                    <Select
                      value={uploadAlbumId}
                      onValueChange={setUploadAlbumId}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Album (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {albums.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {pendingFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {pendingFiles.length} image(s) selected — click Upload to add them.
                    </p>
                    <div className="grid max-h-[280px] grid-cols-3 gap-2 overflow-y-auto rounded-lg border p-2 sm:grid-cols-4">
                      {pendingFiles.map((file, i) => (
                        <div
                          key={`${file.name}-${i}`}
                          className="group relative aspect-square overflow-hidden rounded-md bg-muted"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={previewUrls[i]}
                            alt={file.name}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePendingFile(i)}
                            className="absolute right-1 top-1 rounded-full bg-destructive/90 p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                            aria-label="Remove"
                          >
                            <IconX className="size-3.5" />
                          </button>
                          <p className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-1 py-0.5 text-[10px] text-white">
                            {file.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearPendingAndClose}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUploadClick}
                  disabled={pendingFiles.length === 0 || uploading}
                >
                  {uploading ? "Uploading..." : "Upload Images"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {albums.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedAlbum === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedAlbum("all")}
          >
            All Images ({images.length})
          </Button>
          {albums.map((a) => (
            <Button
              key={a.id}
              variant={selectedAlbum === a.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedAlbum(a.id)}
            >
              {a.name} ({a.images?.length ?? 0})
            </Button>
          ))}
        </div>
      )}

      {displayImages.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-4 py-16">
          <IconPhoto className="size-16 text-muted-foreground" />
          <p className="text-muted-foreground">
            {selectedAlbum === "all"
              ? "No images yet. Upload some images to get started."
              : "No images in this album."}
          </p>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <IconPlus className="mr-2 size-4" />
              Upload Images
            </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {displayImages.map((img) => (
            <Card
              key={img.id}
              className="group overflow-hidden transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.filename}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="truncate p-2 text-xs text-muted-foreground">
                {img.filename}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
