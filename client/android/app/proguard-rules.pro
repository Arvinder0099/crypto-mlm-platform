# ======================================
# Hexanova ProGuard / R8 Rules
# ======================================

# Keep line numbers for crash reports
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# ---- Capacitor Core ----
-keep class com.getcapacitor.** { *; }
-keep class com.hexanova.app.** { *; }
-dontwarn com.getcapacitor.**

# ---- Capacitor Plugin Classes ----
-keep @com.getcapacitor.annotation.CapacitorPlugin public class * {
    public *;
}
-keep class * extends com.getcapacitor.Plugin { *; }

# ---- WebView / JavaScript Interface ----
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes JavascriptInterface

# ---- AndroidX ----
-keep class androidx.** { *; }
-dontwarn androidx.**

# ---- Google Play Services ----
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# ---- Firebase / GMS ----
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# ---- Cordova Plugins (Capacitor compat) ----
-keep class org.apache.cordova.** { *; }
-dontwarn org.apache.cordova.**

# ---- General Android ----
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Application
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider

# ---- Serialization ----
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# ---- Enums ----
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# ---- Suppress warnings ----
-dontwarn org.bouncycastle.**
-dontwarn org.conscrypt.**
-dontwarn org.openjsse.**
