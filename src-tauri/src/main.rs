// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::fs::Metadata;
use std::path::Path;
use walkdir::WalkDir;
use walkdir::DirEntry;
use serde::{Serialize, Deserialize};

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![get_tracks])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

fn is_hidden(entry: &DirEntry) -> bool {
  entry.file_name()
    .to_str()
    .map(|s| s.starts_with("."))
    .unwrap_or(false)
}

const ALLOWED_FILE_EXTENSIONS: [&str; 8] = ["aiff", "flac", "m4a", "mid", "mp3", "mp4", "ogg", "wav"];

// fn is_allowed_mime_type(path: String) -> bool {
//   ALLOWED_FILE_EXTENSIONS.contains(Path::new(&path).extension().and_then(OsStr::to_str).unwrap())
// }

fn get_file_metadata(path: String) -> Metadata {
  let metadata = match fs::metadata(path) {
      Ok(data) => data,
      Err(error) => panic!("Problem fetching metadata: {error:?}")
  };

  metadata
}


#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Track {
  id: String,
  title: String,
  artists: String,
  album_artists: String,
  album: String,
  genre: String,
  duration: u16,
  track_number: u16,
  disc_number: String,
  source: String,
  year: u16,
  cover: String
}

#[tauri::command]
fn get_tracks(paths: Vec<String>) -> Vec<Metadata> {
// fn get_tracks(paths: Vec<String>) -> Vec<Track> {
  let mut file_paths: Vec<String> = Vec::new();
  let mut tracks: Vec<Metadata> = Vec::new();

  for path in paths {
    if Path::new(&path).is_dir() {
      //TODO: add is_dir(entry) filter properly
      for entry in WalkDir::new(path).into_iter().filter_entry(|e| !is_hidden(e)) {
        let file_path = match entry {
            Ok(entry) => entry.path().to_str().unwrap().to_string(),
            Err(error) => panic!("Problem opening the file: {error:?}")
        };

        if Path::new(&file_path).is_file() {
          file_paths.push(file_path);
        }
      }
    }
    else {
        file_paths.push(path);
    }
  }

  for file_path in file_paths {
    tracks.push(get_file_metadata(file_path));
  }


  // keep only files with audio mime types

  // fetch metadata

  // tracks
  tracks
}
