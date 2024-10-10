// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use base64::prelude::BASE64_STANDARD;
use base64::Engine;
use std::io::Write;
use std::path::Path;
use audiotags::Picture;
use audiotags::Tag;
use uuid::Uuid;
use walkdir::WalkDir;
use walkdir::DirEntry;
use serde::{Serialize, Deserialize};

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![get_tracks])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

const ALLOWED_FILE_EXTENSIONS: [&str; 6] = ["aiff", "flac", "m4a", "mp3", "mp4", "wav"];

fn is_allowed_mime_type(path: &String) -> bool {
  let extension = Path::new(&path).extension().unwrap().to_str().unwrap();

  ALLOWED_FILE_EXTENSIONS.contains(&extension)
}

fn buffer_to_b64(buffer: &[u8]) -> String {
  let mut bytes: Vec<u8> = Vec::new();

  let _ = bytes.write(buffer);

  BASE64_STANDARD.encode(bytes)
}

fn encode_album_cover(picture: Picture) -> String {
  let encoded_image :String = buffer_to_b64(picture.data);
  let mime_type: String = picture.mime_type.try_into().unwrap();

  format!("data:{mime_type};base64,{encoded_image}")
}


#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Track {
  id: String,
  title: String,
  album_title: String,
  artists: String,
  album_artists: String,
  genre: String,
  duration: f64,
  track_number: u16,
  disc_number: u16,
  source: String,
  year: i32,
  cover: String
}

fn get_file_metadata(path: String) -> Track {
  let source = format!("file://{path}");
  let tags = Tag::new().read_from_path(path).unwrap();

  let track  = Track {
      id: Uuid::new_v4().to_string(),
      title: tags.title().unwrap().to_string(),
      album_title: match tags.album() {
          Some(a) => a.title.to_string(),
          None => "".to_string()
      },
      artists: match tags.artists() {
          Some(arr) => arr.join(","),
          None => "".to_string()
      },
      album_artists: match tags.album_artists() {
          Some(arr) => arr.join(","),
          None => "".to_string()
      },
      genre: tags.genre().unwrap_or_else(|| "").to_string(),
      duration: tags.duration().unwrap_or_else(|| 0.0),
      track_number: tags.track_number().unwrap_or_else(|| 0),
      disc_number: tags.disc_number().unwrap_or_else(|| 0),
      source: source,
      year: tags.year().unwrap_or_else(|| 0),
      cover: match tags.album_cover() {
          Some(a) => encode_album_cover(a),
          None => "".to_string()
      }
  };

  track
}

fn flatten_paths(paths: Vec<String>) -> Vec<String> {
  let mut file_paths: Vec<String> = Vec::new();

  fn is_hidden(entry: &DirEntry) -> bool {
    entry.file_name()
      .to_str()
      .map(|s| s.starts_with("."))
      .unwrap_or(false)
  }

  fn add_file_path(path: &String, paths_list: &mut Vec<String>) {
    if Path::new(path).is_file() && is_allowed_mime_type(path) {
      paths_list.push(path.to_owned());
    }
  }

  for path in paths.into_iter().filter(|p| !Path::new(p).file_name().unwrap().to_str().unwrap_or("").starts_with('.')) {
    if Path::new(&path).is_dir() {
      // TODO: -add is_dir(entry) filter properly
      for entry in WalkDir::new(path).into_iter().filter_entry(|e| !is_hidden(e)) {
        let file_path = match entry {
            Ok(entry) => entry.path().to_str().unwrap().to_string(),
            Err(error) => panic!("Problem opening the file: {error:?}")
        };

        add_file_path(&file_path, &mut file_paths);
      }
    }
    else {
      add_file_path(&path, &mut file_paths);
    }
  }

  file_paths
}

#[tauri::command]
fn get_tracks(paths: Vec<String>) -> Vec<Track> {
  let mut file_paths: Vec<String> = flatten_paths(paths);
  let mut tracks: Vec<Track> = Vec::new();

  file_paths.sort();

  for file_path in file_paths {
    tracks.push(get_file_metadata(file_path));
  }

  tracks
}
